// Small fetch wrapper for talking to the FastAPI backend (see /backend).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const TOKEN_KEY = "fhf-admin-token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function handleResponse(res) {
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {
      /* ignore parse errors */
    }
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, { method = "GET", body, auth = false, isForm = false } = {}) {
  const headers = { ...(auth ? authHeaders() : {}) };
  let payload = body;
  if (body !== undefined && !isForm) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: payload });
  return handleResponse(res);
}

// ---------- Public site ----------

export function submitOrder(payload) {
  return request("/api/orders", { method: "POST", body: payload });
}

export function fetchPickupDates() {
  return request("/api/pickup-dates");
}

export function fetchBreadCatalog(lang = "en") {
  return request(`/api/orders/catalog?lang=${encodeURIComponent(lang)}`);
}

export function submitContact(payload) {
  return request("/api/contact", { method: "POST", body: payload });
}

export function fetchContent() {
  return request("/api/content");
}

export function recordPageview(payload) {
  return request("/api/analytics/pageview", { method: "POST", body: payload }).catch(() => {
    /* analytics must never break the site */
  });
}

// ---------- Admin auth ----------

export function authStatus() {
  return request("/api/auth/status");
}

export function signup(username, email, password) {
  return request("/api/auth/signup", { method: "POST", body: { username, email, password } });
}

export function login(username, password) {
  return request("/api/auth/login", { method: "POST", body: { username, password } });
}

export function fetchMe() {
  return request("/api/auth/me", { auth: true });
}

export function forgotUsername(email) {
  return request("/api/auth/forgot-username", { method: "POST", body: { email } });
}

export function forgotPassword(identifier) {
  return request("/api/auth/forgot-password", { method: "POST", body: { identifier } });
}

export function resetPassword(token, newPassword) {
  return request("/api/auth/reset-password", { method: "POST", body: { token, new_password: newPassword } });
}

export function changePassword(currentPassword, newPassword) {
  return request("/api/auth/change-password", {
    method: "POST",
    auth: true,
    body: { current_password: currentPassword, new_password: newPassword },
  });
}

// ---------- Admin content ----------

export function updateContent(key, lang, data) {
  return request(`/api/admin/content/${key}`, { method: "PUT", auth: true, body: { lang, data } });
}

// ---------- Admin uploads ----------

export function uploadFile(file, onProgress) {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/api/admin/uploads`);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new Error(data.detail || "Upload failed"));
      } catch {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed — is the backend running?"));
    xhr.send(form);
  });
}

export function listUploads() {
  return request("/api/admin/uploads", { auth: true });
}

export function deleteUpload(filename) {
  return request(`/api/admin/uploads/${encodeURIComponent(filename)}`, { method: "DELETE", auth: true });
}

// ---------- Admin orders / messages ----------

export function listOrders() {
  return request("/api/orders", { auth: true });
}

export function getOrder(id) {
  return request(`/api/orders/${id}`, { auth: true });
}

export function updateOrderStatus(id, status) {
  return request(`/api/orders/${id}/status`, { method: "PATCH", auth: true, body: { status } });
}

export function listPickupDatesAdmin() {
  return request("/api/admin/pickup-dates", { auth: true });
}

export function createPickupDate(date, maxBreads) {
  return request("/api/admin/pickup-dates", { method: "POST", auth: true, body: { date, max_breads: maxBreads } });
}

export function updatePickupDate(id, payload) {
  return request(`/api/admin/pickup-dates/${id}`, { method: "PATCH", auth: true, body: payload });
}

export function deletePickupDate(id) {
  return request(`/api/admin/pickup-dates/${id}`, { method: "DELETE", auth: true });
}

export function fetchPickupDateReport(isoDate) {
  return request(`/api/admin/pickup-dates/${isoDate}/report`, { auth: true });
}

export function fetchPickupRangeReport({ start, end, period }) {
  const qs = new URLSearchParams({ start, end, period: period || "range" });
  return request(`/api/admin/pickup-dates/report/range?${qs}`, { auth: true });
}

export function listContactMessages() {
  return request("/api/contact", { auth: true });
}

export function updateContactStatus(id, status) {
  return request(`/api/contact/${id}/status`, { method: "PATCH", auth: true, body: { status } });
}

// ---------- Admin analytics ----------

export function fetchAnalyticsSummary(days = 30) {
  return request(`/api/admin/analytics/summary?days=${days}`, { auth: true });
}

export { API_BASE_URL };
