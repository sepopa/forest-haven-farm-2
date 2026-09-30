import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listOrders } from "../../api";

// pickup_date is an ISO date string like "2026-08-29" — render it as "Wed, Sep 9".
function pickupDay(isoDate) {
  if (!isoDate) return "—";
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function csvCell(value) {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportOrdersCsv(orders) {
  const headers = [
    "Order #",
    "Client Name",
    "Email",
    "Phone",
    "Pickup Date",
    "Pickup Day",
    "Pickup Location",
    "Total",
    "Status",
    "Placed",
  ];
  const rows = orders.map((o) => [
    o.id,
    o.name,
    o.email,
    o.phone,
    o.pickup_date,
    pickupDay(o.pickup_date),
    o.pickup_location,
    typeof o.total_amount === "number" ? o.total_amount.toFixed(2) : o.total_amount,
    o.status,
    o.created_at,
  ]);
  const csv = [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");

  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function OrdersInbox() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    listOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Orders</h1>
          <p className="admin-page-desc">Order requests submitted from the Orders page, newest first.</p>
        </div>
        <div className="admin-actions">
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => exportOrdersCsv(orders)}
            disabled={orders.length === 0}
          >
            Export CSV
          </button>
        </div>
      </div>
      {error && <div className="admin-error">{error}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : orders.length === 0 ? (
        <p className="admin-empty">No orders yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th><th>Client Name</th><th>Email</th><th>Phone</th><th>Pickup Date</th><th>Total</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.name}</td>
                  <td>{o.email}</td>
                  <td>{o.phone}</td>
                  <td>{pickupDay(o.pickup_date)}</td>
                  <td>${o.total_amount.toFixed(2)}</td>
                  <td><span className={`admin-status-pill admin-status-pill-${o.status}`}>{o.status}</span></td>
                  <td>
                    <Link to={`/admin/orders/${o.id}`} className="admin-btn admin-btn-ghost admin-btn-small">
                      See details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
