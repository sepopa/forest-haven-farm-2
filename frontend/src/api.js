// Data layer for the whole site, backed by InsForge (https://insforge.dev).
//
// This used to be a fetch wrapper around the FastAPI backend. Every function
// keeps its old name and returns the same shape, so the pages didn't change —
// but each one now calls the InsForge SDK directly:
//   * business logic lives in Postgres functions (see /migrations), called
//     with insforge.database.rpc(...)
//   * admin login uses InsForge Auth
//   * admin uploads go to the public "media" storage bucket
//   * order emails are sent by the "order-emails" edge function (/functions)
import { insforge, MEDIA_BUCKET } from "./insforge";

// Turns an InsForge { data, error } result into a value or a thrown Error,
// like the old fetch wrapper did.
async function unwrap(promise) {
  const { data, error } = await promise;
  if (error) {
    const err = new Error(error.message || "Something went wrong.");
    err.status = error.statusCode || error.status;
    throw err;
  }
  return data;
}

function rpc(fn, args) {
  return unwrap(insforge.database.rpc(fn, args));
}

// ---------- Public site ----------

export async function submitOrder(payload) {
  const order = await rpc("place_order", { p_order: payload });
  // Owner notification + customer confirmation. Fire-and-forget: the order is
  // already saved, and a scheduled sweep re-sends anything this call misses.
  insforge.functions.invoke("order-emails", { body: { order_id: order.id } }).catch(() => {});
  return order;
}

export function fetchPickupDates() {
  return rpc("list_pickup_dates");
}

export function fetchBreadCatalog(lang = "en") {
  return rpc("get_bread_catalog", { p_lang: lang });
}

export function submitContact({ name, email, subject, message }) {
  return rpc("submit_contact", { p_name: name, p_email: email, p_subject: subject, p_message: message });
}

export function fetchContent() {
  return rpc("get_site_content");
}

export function recordPageview({ path, referrer, device_type, lang, visitor_id }) {
  return rpc("record_pageview", {
    p_path: path,
    p_visitor_id: visitor_id,
    p_referrer: referrer || null,
    p_device_type: device_type || "desktop",
    p_lang: lang || null,
  }).catch(() => {
    /* analytics must never break the site */
  });
}

// ---------- Admin auth ----------

const NOT_ADMIN_MESSAGE = "This account isn't the site's admin login.";

function siteUrl(path) {
  return `${window.location.origin}${path}`;
}

export async function authStatus() {
  const setupRequired = await rpc("admin_setup_required");
  return { setup_required: !!setupRequired };
}

// One-time setup: creates the InsForge account and makes it the site's admin.
// Returns { admin } when signed in straight away, or { verifyEmail: true } when
// InsForge first needs the email address confirmed (then log in afterwards).
export async function signup(username, email, password) {
  const data = await unwrap(
    insforge.auth.signUp({ email, password, name: username, redirectTo: siteUrl("/admin/login") }),
  );
  if (data?.requireEmailVerification || !data?.accessToken) {
    localStorage.setItem("fhf-pending-admin-username", username);
    return { verifyEmail: true };
  }
  const admin = await rpc("claim_first_admin", { p_username: username });
  return { admin };
}

export async function login(email, password) {
  await unwrap(insforge.auth.signInWithPassword({ email, password }));
  try {
    // First login after confirming the setup email: finish claiming the admin role.
    const { setup_required } = await authStatus();
    if (setup_required) {
      const username = localStorage.getItem("fhf-pending-admin-username") || null;
      await rpc("claim_first_admin", { p_username: username });
      localStorage.removeItem("fhf-pending-admin-username");
    }
    return await rpc("admin_me");
  } catch (err) {
    await insforge.auth.signOut();
    if (err.status === 401 || /not authenticated/i.test(err.message)) throw new Error(NOT_ADMIN_MESSAGE);
    throw err;
  }
}

// The signed-in admin, or null. Restores the session after a page reload.
export async function fetchMe() {
  const { data } = await insforge.auth.getCurrentUser();
  if (!data?.user) return null;
  try {
    return await rpc("admin_me");
  } catch {
    return null;
  }
}

export async function logout() {
  await insforge.auth.signOut();
}

export async function forgotPassword(email) {
  await unwrap(insforge.auth.sendResetPasswordEmail({ email, redirectTo: siteUrl("/admin/reset-password") }));
  return { message: "If an account matches that email, we've sent a link to reset your password." };
}

export async function resetPassword(token, newPassword) {
  await unwrap(insforge.auth.resetPassword({ newPassword, otp: token }));
  return { message: "Your password has been reset. You can now log in." };
}

// ---------- Admin content ----------

export function updateContent(key, lang, data) {
  return rpc("admin_update_content", { p_key: key, p_lang: lang ?? null, p_data: data });
}

// ---------- Admin uploads (InsForge Storage, public "media" bucket) ----------

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4"]);
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB

export async function uploadFile(file, onProgress) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Unsupported file type. Use JPEG, PNG, WebP, GIF, or MP4.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File is too large (15 MB max).");
  }
  onProgress?.(0);
  const data = await unwrap(insforge.storage.from(MEDIA_BUCKET).uploadAuto(file));
  onProgress?.(100);
  return { url: data.url, filename: data.key };
}

export async function listUploads() {
  const data = await unwrap(insforge.storage.from(MEDIA_BUCKET).list({ limit: 1000 }));
  const objects = Array.isArray(data) ? data : data?.objects ?? [];
  return objects
    .map((o) => ({ filename: o.key, url: o.url, size: o.size ?? 0, modified_at: o.uploadedAt ?? "" }))
    .sort((a, b) => String(b.modified_at).localeCompare(String(a.modified_at)));
}

export async function deleteUpload(filename) {
  await unwrap(insforge.storage.from(MEDIA_BUCKET).remove(filename));
  return { ok: true };
}

// ---------- Admin orders / messages ----------

export function listOrders() {
  return rpc("admin_list_orders");
}

export function getOrder(id) {
  return rpc("admin_get_order", { p_id: Number(id) });
}

export function updateOrderStatus(id, status) {
  return rpc("admin_update_order_status", { p_id: Number(id), p_status: status });
}

export function listPickupDatesAdmin() {
  return rpc("admin_list_pickup_dates");
}

export function createPickupDate(date, maxBreads) {
  return rpc("admin_create_pickup_date", { p_date: date, p_max_breads: maxBreads });
}

export function updatePickupDate(id, { max_breads, is_open } = {}) {
  return rpc("admin_update_pickup_date", {
    p_id: Number(id),
    p_max_breads: max_breads ?? null,
    p_is_open: is_open ?? null,
  });
}

export async function deletePickupDate(id) {
  await rpc("admin_delete_pickup_date", { p_id: Number(id) });
  return null;
}

export function fetchPickupDateReport(isoDate) {
  return rpc("admin_pickup_date_report", { p_date: isoDate });
}

export function fetchPickupRangeReport({ start, end, period }) {
  return rpc("admin_pickup_range_report", { p_start: start, p_end: end, p_period: period || "range" });
}

export function listContactMessages() {
  return rpc("admin_list_contact_messages");
}

export function updateContactStatus(id, status) {
  return rpc("admin_update_contact_status", { p_id: Number(id), p_status: status });
}

// ---------- Admin analytics ----------

export function fetchAnalyticsSummary(days = 30) {
  return rpc("admin_analytics_summary", { p_days: days });
}
