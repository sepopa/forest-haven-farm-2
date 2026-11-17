// Forest Haven Farm — order emails (InsForge Edge Function, Deno).
//
// Replaces backend/app/email_service.py. For each new order it sends:
//   1. the owner a "new order" bill (Reply-To = the customer), and
//   2. the customer a branded confirmation (Reply-To = the owner).
//
// Two ways it runs:
//   * POST { "order_id": 123 } — the Orders page calls this right after an
//     order is placed (see frontend/src/api.js → submitOrder).
//   * POST {} — the "order-emails-sweep" schedule calls this every 10 minutes
//     and picks up any order whose emails were never sent (e.g. the customer
//     closed the tab before the first call went out).
//
// Each order is "claimed" by setting orders.emails_sent_at before sending, so
// the two paths can never email the same order twice. Anyone can call this
// function, but it only ever acts on recent orders that haven't been emailed.
//
// Secrets it reads (set with `npx @insforge/cli secrets add …`):
//   SITE_URL             optional — public URL of the site, used for the logo
//                        in the email header (e.g. https://foresthavenfarm.insforge.site)
//   ORDER_NOTIFY_EMAIL   optional — fallback owner address if the admin panel's
//                        Parameters → "Order notification email" is empty
// INSFORGE_BASE_URL and API_KEY are built-in secrets on every project.

import { createClient } from "npm:@insforge/sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const SINGLE_ORDER_MAX_AGE_MINUTES = 60;
const SWEEP_MIN_AGE_MINUTES = 2; // give the browser's own call a head start
const SWEEP_MAX_AGE_HOURS = 24; // never email old/imported orders
const SWEEP_BATCH = 20;

type OrderRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  pickup_date: string;
  pickup_location: string;
  notes: string | null;
  created_at: string;
};

type ItemRow = {
  bread_item: string;
  quantity: number;
  unit_price: number | string;
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function money(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function placedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "America/New_York",
  });
}

function headerHtml(siteUrl: string): string {
  const logo = siteUrl
    ? `<img src="${esc(siteUrl)}/assets/logo/logo-full.png" alt="Forest Haven Farm" style="max-width:220px;height:auto;display:inline-block;">`
    : `<div style="font-size:22px;font-weight:bold;color:#5E3119;">Forest Haven Farm</div>`;
  return `
    <div style="background:#FBF3E4;padding:22px 24px;border-radius:10px 10px 0 0;text-align:center;border-bottom:2px solid #8A4B2B;">
      ${logo}
      <p style="margin:8px 0 0;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#8A4B2B;">Real Sourdough Bread</p>
    </div>`;
}

function billTableHtml(order: OrderRow, items: ItemRow[]): string {
  let total = 0;
  const rows = items
    .map((item) => {
      const unit = Number(item.unit_price);
      const line = Math.round(unit * item.quantity * 100) / 100;
      total += line;
      return `
      <tr>
        <td style="padding:8px 10px;border-bottom:1px solid #e6ddce;">${esc(item.bread_item)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e6ddce;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e6ddce;text-align:right;">${money(unit)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e6ddce;text-align:right;">${money(line)}</td>
      </tr>`;
    })
    .join("");

  return `
    <table style="width:100%;font-size:14px;margin-bottom:16px;">
      <tr><td style="color:#58493D;">Order #</td><td style="text-align:right;font-weight:bold;">${order.id}</td></tr>
      <tr><td style="color:#58493D;">Placed</td><td style="text-align:right;">${placedDate(order.created_at)}</td></tr>
      <tr><td style="color:#58493D;">Pickup date</td><td style="text-align:right;">${esc(order.pickup_date)}</td></tr>
      <tr><td style="color:#58493D;">Pickup location</td><td style="text-align:right;">${esc(order.pickup_location)}</td></tr>
    </table>

    <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#8A4B2B;margin:0 0 6px;">Bill To</h3>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.5;">
      ${esc(order.name)}<br>${esc(order.email)}<br>${esc(order.phone)}
    </p>

    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#F3E6CE;">
          <th style="padding:8px 10px;text-align:left;">Item</th>
          <th style="padding:8px 10px;text-align:center;">Qty</th>
          <th style="padding:8px 10px;text-align:right;">Unit</th>
          <th style="padding:8px 10px;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <table style="width:100%;font-size:15px;margin-top:12px;">
      <tr>
        <td style="font-weight:bold;">Total Due</td>
        <td style="text-align:right;font-weight:bold;font-size:18px;color:#5E3119;">${money(total)}</td>
      </tr>
    </table>

    ${order.notes ? `<p style="margin-top:16px;font-size:13px;color:#58493D;"><strong>Notes:</strong> ${esc(order.notes)}</p>` : ""}`;
}

function wrap(siteUrl: string, inner: string): string {
  return `
  <div style="font-family:Georgia,'Times New Roman',serif;max-width:560px;margin:0 auto;color:#2B2420;">
    ${headerHtml(siteUrl)}
    <div style="border:1px solid #e6ddce;border-top:none;padding:20px 24px;border-radius:0 0 10px 10px;">
      ${inner}
    </div>
  </div>`;
}

export default async function (req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);

  const baseUrl = Deno.env.get("INSFORGE_BASE_URL");
  const apiKey = Deno.env.get("API_KEY");
  if (!baseUrl || !apiKey) return json({ error: "Function is missing INSFORGE_BASE_URL / API_KEY." }, 500);
  const siteUrl = (Deno.env.get("SITE_URL") || "").replace(/\/+$/, "");

  // The admin API key reads/writes orders regardless of row-level security.
  const db = createClient({ baseUrl, accessToken: apiKey });

  let body: { order_id?: number | string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // 1) Which orders to handle.
  const now = Date.now();
  let candidates = db.database.from("orders").select("id").is("emails_sent_at", null);
  if (body.order_id !== undefined && body.order_id !== null && body.order_id !== "") {
    const id = Number(body.order_id);
    if (!Number.isInteger(id) || id <= 0) return json({ error: "Invalid order_id." }, 400);
    candidates = candidates
      .eq("id", id)
      .gte("created_at", new Date(now - SINGLE_ORDER_MAX_AGE_MINUTES * 60_000).toISOString());
  } else {
    candidates = candidates
      .gte("created_at", new Date(now - SWEEP_MAX_AGE_HOURS * 3_600_000).toISOString())
      .lte("created_at", new Date(now - SWEEP_MIN_AGE_MINUTES * 60_000).toISOString())
      .order("created_at", { ascending: true })
      .limit(SWEEP_BATCH);
  }
  const { data: pending, error: pendingError } = await candidates;
  if (pendingError) return json({ error: pendingError.message }, 500);
  if (!pending?.length) return json({ sent: 0 });

  // 2) Owner address: admin Parameters → "Order notification email", else secret.
  const { data: paramRows } = await db.database
    .from("content_blocks")
    .select("data")
    .eq("key", "parameters")
    .eq("lang", "")
    .limit(1);
  const ownerEmail: string =
    paramRows?.[0]?.data?.orderNotifyEmail || Deno.env.get("ORDER_NOTIFY_EMAIL") || "";

  let sent = 0;
  const failures: string[] = [];

  for (const { id } of pending as { id: number }[]) {
    // 3) Claim it — only one caller can flip emails_sent_at from null.
    const { data: claimed, error: claimError } = await db.database
      .from("orders")
      .update({ emails_sent_at: new Date().toISOString() })
      .eq("id", id)
      .is("emails_sent_at", null)
      .select("id, name, email, phone, pickup_date, pickup_location, notes, created_at");
    if (claimError || !claimed?.length) continue;
    const order = claimed[0] as OrderRow;

    const { data: items } = await db.database
      .from("order_items")
      .select("bread_item, quantity, unit_price")
      .eq("order_id", id)
      .order("id", { ascending: true });
    const bill = billTableHtml(order, (items ?? []) as ItemRow[]);

    const errors: string[] = [];

    if (ownerEmail) {
      const { error } = await db.emails.send({
        to: ownerEmail,
        subject: `New order #${order.id} — ${order.name} (pickup ${order.pickup_date})`,
        html: wrap(siteUrl, `${bill}<p style="margin-top:20px;font-size:12px;color:#58493D;">Payment is due at pickup.</p>`),
        replyTo: order.email,
        from: "Forest Haven Farm",
      });
      if (error) errors.push(`owner: ${error.message}`);
    } else {
      errors.push("owner: no notification address set (admin → Parameters)");
    }

    const { error: customerError } = await db.emails.send({
      to: order.email,
      subject: `Forest Haven Farm — order #${order.id} received`,
      html: wrap(
        siteUrl,
        `<p style="font-size:15px;line-height:1.6;margin:0 0 18px;">Thanks! Your order request was received — we'll confirm by email or phone within 24 hours.</p>
         ${bill}
         <p style="margin-top:20px;font-size:12px;color:#58493D;">Payment is due at pickup. Thank you for supporting the farm!</p>`,
      ),
      ...(ownerEmail ? { replyTo: ownerEmail } : {}),
      from: "Forest Haven Farm",
    });
    if (customerError) errors.push(`customer: ${customerError.message}`);

    if (errors.length) {
      failures.push(`#${id} ${errors.join("; ")}`);
      console.error(`order-emails: order #${id}: ${errors.join("; ")}`);
      await db.database.from("orders").update({ email_error: errors.join("; ").slice(0, 1000) }).eq("id", id);
    } else {
      sent += 1;
    }
  }

  return json({ sent, failures });
}
