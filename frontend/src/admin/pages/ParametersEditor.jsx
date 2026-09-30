import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { updateContent } from "../../api";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DEFAULTS = {
  orderNotifyEmail: "",
  orderCutoffDays: 3,
  rollingWeeksAhead: 8,
  pickupDays: [
    { weekday: 0, maxBreads: 20 },
    { weekday: 2, maxBreads: 20 },
  ],
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Circular distance on a 7-day week — the two pickup days must be >= 2 apart.
function weekdayGapOk(a, b) {
  const diff = Math.abs(a - b);
  return Math.min(diff, 7 - diff) >= 2;
}

function validate(form) {
  if (!EMAIL_RE.test((form.orderNotifyEmail || "").trim())) {
    return "Enter a valid order notification email address.";
  }
  const cutoff = Number(form.orderCutoffDays);
  if (!Number.isInteger(cutoff) || cutoff < 0 || cutoff > 14) {
    return "Order cutoff must be a whole number between 0 and 14 days.";
  }
  const weeks = Number(form.rollingWeeksAhead);
  if (!Number.isInteger(weeks) || weeks < 1 || weeks > 52) {
    return "Rolling weeks ahead must be a whole number between 1 and 52.";
  }
  const [d0, d1] = form.pickupDays;
  for (const d of form.pickupDays) {
    const m = Number(d.maxBreads);
    if (!Number.isInteger(m) || m < 1 || m > 1000) {
      return "Each pickup day's max breads must be a whole number between 1 and 1000.";
    }
  }
  if (d0.weekday === d1.weekday) {
    return "The two pickup days must fall on different weekdays.";
  }
  if (!weekdayGapOk(d0.weekday, d1.weekday)) {
    return "The two pickup days must be at least 2 days apart.";
  }
  return null;
}

export default function ParametersEditor() {
  const { content, refreshContent } = useLanguage();
  const stored = content?.parameters;

  const [form, setForm] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!stored) return;
    setForm({
      orderNotifyEmail: stored.orderNotifyEmail ?? DEFAULTS.orderNotifyEmail,
      orderCutoffDays: stored.orderCutoffDays ?? DEFAULTS.orderCutoffDays,
      rollingWeeksAhead: stored.rollingWeeksAhead ?? DEFAULTS.rollingWeeksAhead,
      pickupDays:
        Array.isArray(stored.pickupDays) && stored.pickupDays.length === 2
          ? stored.pickupDays.map((d) => ({ weekday: d.weekday, maxBreads: d.maxBreads }))
          : DEFAULTS.pickupDays,
    });
  }, [stored]);

  const error = useMemo(() => validate(form), [form]);

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const setDay = (idx, key) => (e) =>
    setForm((f) => ({
      ...f,
      pickupDays: f.pickupDays.map((d, i) =>
        i === idx ? { ...d, [key]: Number(e.target.value) } : d,
      ),
    }));

  const save = async (e) => {
    e.preventDefault();
    if (error) {
      setStatus({ type: "error", text: error });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      await updateContent("parameters", null, {
        orderNotifyEmail: form.orderNotifyEmail.trim(),
        orderCutoffDays: Number(form.orderCutoffDays),
        rollingWeeksAhead: Number(form.rollingWeeksAhead),
        pickupDays: form.pickupDays.map((d) => ({
          weekday: Number(d.weekday),
          maxBreads: Number(d.maxBreads),
        })),
      });
      await refreshContent();
      setStatus({ type: "success", text: "Saved. Upcoming pickup dates were updated to match." });
    } catch (err) {
      setStatus({ type: "error", text: err.message || "Save failed." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Parameters</h1>
          <p className="admin-page-desc">
            Operational settings: where order notifications go, and the pickup schedule and
            capacity rules that drive the Orders page and Pickup Dates.
          </p>
        </div>
      </div>

      <form className="admin-settings-form" onSubmit={save}>
        <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
          <label>Order notification email</label>
          <input
            type="email"
            value={form.orderNotifyEmail}
            onChange={setField("orderNotifyEmail")}
            placeholder="orders@foresthavenfarm.com"
          />
          <span className="admin-field-hint">
            Every new order request and its bill are emailed here.
          </span>
        </div>

        <div className="admin-field">
          <label>Order cutoff (days before pickup)</label>
          <input
            type="number"
            min="0"
            max="14"
            value={form.orderCutoffDays}
            onChange={setField("orderCutoffDays")}
          />
          <span className="admin-field-hint">
            Ordering for a pickup date closes this many days before it.
          </span>
        </div>

        <div className="admin-field">
          <label>Open pickup dates this many weeks ahead</label>
          <input
            type="number"
            min="1"
            max="52"
            value={form.rollingWeeksAhead}
            onChange={setField("rollingWeeksAhead")}
          />
          <span className="admin-field-hint">
            How far into the future the Orders calendar shows pickup dates.
          </span>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <h2 className="admin-section-title">Pickup days</h2>
          <p className="admin-page-desc">
            Exactly two per week, at least 2 days apart. Each day&apos;s max breads is the capacity
            every pickup date on that weekday is created with — the Orders page blocks orders once a
            date is full.
          </p>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pickup day</th>
                  <th>Weekday</th>
                  <th>Max breads</th>
                </tr>
              </thead>
              <tbody>
                {form.pickupDays.map((d, i) => (
                  <tr key={i}>
                    <td>Day {i + 1}</td>
                    <td>
                      <select value={d.weekday} onChange={setDay(i, "weekday")}>
                        {WEEKDAYS.map((name, wd) => (
                          <option key={wd} value={wd}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        style={{ width: "90px" }}
                        value={d.maxBreads}
                        onChange={setDay(i, "maxBreads")}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-actions" style={{ gridColumn: "1 / -1" }}>
          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving || !!error}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {error && <span className="admin-status admin-status-error">{error}</span>}
          {!error && status && (
            <span className={`admin-status admin-status-${status.type}`}>{status.text}</span>
          )}
        </div>
      </form>
    </div>
  );
}
