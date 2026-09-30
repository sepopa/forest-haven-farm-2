import { useEffect, useState } from "react";
import {
  listPickupDatesAdmin,
  createPickupDate,
  updatePickupDate,
  deletePickupDate,
  fetchPickupRangeReport,
} from "../../api";

function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Inclusive [start, end] pickup-date window for the chosen period around `refISO`.
function periodRange(period, refISO) {
  const ref = new Date(`${refISO}T00:00:00`);
  if (period === "day") return { start: refISO, end: refISO };
  if (period === "week") {
    const dow = (ref.getDay() + 6) % 7; // Monday = 0
    const start = new Date(ref);
    start.setDate(ref.getDate() - dow);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: toISO(start), end: toISO(end) };
  }
  // month
  const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
  return { start: toISO(start), end: toISO(end) };
}

function downloadCsv(filename, rows) {
  const csv = rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function PickupDatesManager() {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newMax, setNewMax] = useState(20);
  const [reportPeriod, setReportPeriod] = useState("day"); // day | week | month
  const [reportDate, setReportDate] = useState(() => toISO(new Date()));
  const [report, setReport] = useState(null);
  const [reportError, setReportError] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const load = () => {
    setLoading(true);
    listPickupDatesAdmin()
      .then(setDates)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const saveMax = async (id, maxBreads) => {
    try {
      const updated = await updatePickupDate(id, { max_breads: Number(maxBreads) });
      setDates((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleOpen = async (id, isOpen) => {
    try {
      const updated = await updatePickupDate(id, { is_open: !isOpen });
      setDates((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch (err) {
      setError(err.message);
    }
  };

  const removeDate = async (id) => {
    setError(null);
    try {
      await deletePickupDate(id);
      setDates((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const addDate = async (e) => {
    e.preventDefault();
    if (!newDate) return;
    setError(null);
    try {
      const created = await createPickupDate(newDate, Number(newMax) || 20);
      setDates((prev) => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)));
      setNewDate("");
      setNewMax(20);
    } catch (err) {
      setError(err.message);
    }
  };

  const runReport = async (e) => {
    e.preventDefault();
    if (!reportDate) return;
    setReportError(null);
    setReport(null);
    setReportLoading(true);
    try {
      const { start, end } = periodRange(reportPeriod, reportDate);
      const data = await fetchPickupRangeReport({ start, end, period: reportPeriod });
      setReport(data);
    } catch (err) {
      setReportError(err.message);
    } finally {
      setReportLoading(false);
    }
  };

  const exportCsv = () => {
    if (!report) return;
    const rows = [["Pickup Date", "Name", "Email", "Phone", "Bread", "Quantity", "Status", "Notes"]];
    report.dates.forEach((d) => {
      d.orders.forEach((o) => {
        o.items.forEach((it) => {
          rows.push([d.date, o.name, o.email, o.phone, it.bread_item, it.quantity, o.status, o.notes || ""]);
        });
      });
    });
    const label =
      reportPeriod === "day" ? report.start : `${reportPeriod}-${report.start}_to_${report.end}`;
    downloadCsv(`pickup-orders-${label}.csv`, rows);
  };

  const reportOrders = report ? report.dates.flatMap((d) => d.orders.map((o) => ({ ...o, pickup_date: d.date }))) : [];

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Pickup Dates</h1>
          <p className="admin-page-desc">
            Upcoming pickup dates are generated from the weekly schedule and bread caps in{" "}
            <strong>Parameters</strong>. Use this page to override a single date, add a one-off, close
            a date, or run a daily, weekly, or monthly report of pickup orders.
          </p>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <form onSubmit={addDate} className="admin-inline-form">
        <div className="admin-field">
          <label htmlFor="new-pickup-date">Add a date</label>
          <input id="new-pickup-date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required />
        </div>
        <div className="admin-field">
          <label htmlFor="new-pickup-max">Max breads</label>
          <input id="new-pickup-max" type="number" min="1" value={newMax} onChange={(e) => setNewMax(e.target.value)} />
        </div>
        <button type="submit" className="admin-btn admin-btn-primary">Add Date</button>
      </form>

      {loading ? (
        <p>Loading…</p>
      ) : dates.length === 0 ? (
        <p className="admin-empty">No pickup dates yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th><th>Day</th><th>Max Breads</th><th>Ordered</th><th>Remaining</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dates.map((d) => (
                <tr key={d.id}>
                  <td>{d.date}</td>
                  <td>{d.weekday}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      defaultValue={d.max_breads}
                      style={{ width: "70px" }}
                      onBlur={(e) => {
                        if (Number(e.target.value) !== d.max_breads) saveMax(d.id, e.target.value);
                      }}
                    />
                  </td>
                  <td>{d.ordered}</td>
                  <td>{d.remaining}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost"
                      onClick={() => toggleOpen(d.id, d.is_open)}
                    >
                      {d.is_open ? "Open" : "Closed"}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="admin-btn-icon admin-btn-danger"
                      title="Remove date"
                      onClick={() => removeDate(d.id)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="admin-section-title">Pickup Report</h2>
      <form onSubmit={runReport} className="admin-inline-form">
        <div className="admin-field">
          <label htmlFor="report-period">Report basis</label>
          <select
            id="report-period"
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
          >
            <option value="day">Daily</option>
            <option value="week">Weekly (Mon–Sun)</option>
            <option value="month">Monthly</option>
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="report-date">{reportPeriod === "day" ? "Pickup date" : "Any date in period"}</label>
          <input id="report-date" type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} required />
        </div>
        <button type="submit" className="admin-btn admin-btn-primary" disabled={reportLoading}>
          {reportLoading ? "Running…" : "Run Report"}
        </button>
      </form>

      {reportError && <div className="admin-error">{reportError}</div>}

      {report && (
        <div className="admin-report">
          <p>
            <strong>
              {report.start === report.end ? report.start : `${report.start} → ${report.end}`}
            </strong>{" "}
            — {report.total_ordered} of {report.total_capacity} breads ordered across{" "}
            {report.dates.length} pickup date{report.dates.length === 1 ? "" : "s"} ({report.order_count} order
            {report.order_count === 1 ? "" : "s"}).
          </p>

          <h3>Breakdown by bread</h3>
          {Object.keys(report.bread_breakdown).length === 0 ? (
            <p className="admin-empty">No orders in this period yet.</p>
          ) : (
            <ul>
              {Object.entries(report.bread_breakdown).map(([bread, qty]) => (
                <li key={bread}>{bread}: {qty}</li>
              ))}
            </ul>
          )}

          <div className="admin-page-head">
            <h3>Orders</h3>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={exportCsv} disabled={reportOrders.length === 0}>
              Download CSV
            </button>
          </div>
          {reportOrders.length === 0 ? (
            <p className="admin-empty">No orders in this period yet.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pickup Date</th><th>Customer</th><th>Bread</th><th>Status</th><th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {reportOrders.map((o) => (
                    <tr key={o.id}>
                      <td>{o.pickup_date}</td>
                      <td>
                        <div>{o.name}</div>
                        <div className="admin-table-sub">{o.email} · {o.phone}</div>
                      </td>
                      <td>
                        {o.items.map((it) => (
                          <div key={it.id}>{it.bread_item} × {it.quantity}</div>
                        ))}
                      </td>
                      <td>{o.status}</td>
                      <td className="admin-table-notes">{o.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
