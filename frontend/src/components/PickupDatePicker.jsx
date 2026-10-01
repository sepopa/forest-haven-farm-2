import { useEffect, useRef, useState } from "react";

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

// Local date, not toISOString() (UTC) — otherwise "today" is off by one
// in the evening for timezones behind UTC.
function isoToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function monthStart(iso) {
  const [y, m] = iso.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

function fmtLabel(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

/**
 * A pickup-date picker restricted to whatever dates the backend hands it
 * (Mondays/Wednesdays only, per pickup_service.py). Dates that are full,
 * closed, or past their order cutoff are shown but disabled.
 */
export default function PickupDatePicker({ dates, value, onChange, placeholder = "Select a pickup date…" }) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => (value ? monthStart(value) : monthStart(isoToday())));
  const rootRef = useRef(null);

  // Dates arrive async after mount. With nothing picked yet, jump to the month
  // of the first bookable date so the calendar doesn't open on a month whose
  // remaining slots are all full/past cutoff (e.g. late in the month).
  const firstAvailable = dates.find((d) => d.available)?.date;
  useEffect(() => {
    if (!value && firstAvailable) setViewMonth(monthStart(firstAvailable));
  }, [value, firstAvailable]);

  useEffect(() => {
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const byDate = new Map(dates.map((d) => [d.date, d]));
  const selected = value ? byDate.get(value) : null;

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const today = isoToday();
  const canGoPrev = year > new Date().getFullYear() || month > new Date().getMonth();

  const pick = (iso, entry) => {
    if (!entry || !entry.available) return;
    onChange(iso);
    setOpen(false);
  };

  return (
    <div className="pickup-picker" ref={rootRef}>
      <button
        type="button"
        className="pickup-picker-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {selected ? `${fmtLabel(selected.date)} · ${selected.remaining} left` : placeholder}
      </button>

      {open && (
        <div className="pickup-picker-panel" role="dialog">
          <div className="pickup-picker-nav">
            <button
              type="button"
              disabled={!canGoPrev}
              onClick={() => setViewMonth(new Date(year, month - 1, 1))}
              aria-label="Previous month"
            >
              ‹
            </button>
            <span>{MONTH_LABELS[month]} {year}</span>
            <button
              type="button"
              onClick={() => setViewMonth(new Date(year, month + 1, 1))}
              aria-label="Next month"
            >
              ›
            </button>
          </div>
          <div className="pickup-picker-grid pickup-picker-dow">
            {DOW_LABELS.map((l, i) => <span key={i}>{l}</span>)}
          </div>
          <div className="pickup-picker-grid">
            {cells.map((day, i) => {
              if (day === null) return <span key={i} />;
              const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const entry = byDate.get(iso);
              const isPast = iso < today;
              const isSelectable = !!entry && entry.available;
              const classes = ["pickup-picker-day"];
              if (iso === value) classes.push("is-selected");
              if (!isSelectable) classes.push("is-disabled");
              if (isPast) classes.push("is-past");

              let title;
              if (isPast) title = "Past date";
              else if (!entry) title = "Not a pickup day (Mondays & Wednesdays only)";
              else if (!entry.is_open) title = "Closed";
              else if (entry.remaining <= 0) title = "Full — please pick another date";
              else if (!entry.available) title = "Past the order cutoff for this date";
              else title = `${entry.remaining} of ${entry.max_breads} spots left`;

              return (
                <button
                  type="button"
                  key={i}
                  className={classes.join(" ")}
                  disabled={!isSelectable}
                  title={title}
                  onClick={() => pick(iso, entry)}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <p className="pickup-picker-legend">Pickup is available Mondays &amp; Wednesdays only. Greyed-out dates are full, closed, or past the order cutoff.</p>
        </div>
      )}
    </div>
  );
}
