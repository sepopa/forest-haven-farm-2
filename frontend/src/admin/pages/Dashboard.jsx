import { useEffect, useState } from "react";
import { fetchAnalyticsSummary } from "../../api";

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

const PAGE_LABELS = {
  "/": "Home", "/menu": "Menu", "/history": "History", "/process": "Process",
  "/orders": "Orders", "/faq": "FAQ", "/contact": "Contact",
};

export default function Dashboard() {
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchAnalyticsSummary(days)
      .then(setSummary)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [days]);

  const maxDaily = summary ? Math.max(1, ...summary.daily.map((d) => d.views)) : 1;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Dashboard & SEO</h1>
          <p className="admin-page-desc">Traffic to the public site, tracked directly by this app — no third-party account needed.</p>
        </div>
        <div className="admin-lang-tabs">
          {RANGES.map((r) => (
            <button key={r.days} type="button" className={days === r.days ? "is-active" : ""} onClick={() => setDays(r.days)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {loading || !summary ? (
        <p>Loading…</p>
      ) : (
        <>
          <div className="admin-stat-grid">
            <div className="admin-stat-tile">
              <span className="admin-stat-value">{summary.total_views}</span>
              <span className="admin-stat-label">Page views</span>
            </div>
            <div className="admin-stat-tile">
              <span className="admin-stat-value">{summary.unique_visitors}</span>
              <span className="admin-stat-label">Unique visitors</span>
            </div>
            <div className="admin-stat-tile">
              <span className="admin-stat-value">
                {summary.total_views ? (summary.total_views / Math.max(1, summary.unique_visitors)).toFixed(1) : "0"}
              </span>
              <span className="admin-stat-label">Views per visitor</span>
            </div>
            <div className="admin-stat-tile">
              <span className="admin-stat-value">{summary.direct_views}</span>
              <span className="admin-stat-label">Direct visits</span>
            </div>
          </div>

          <div className="admin-panel">
            <h2>Traffic over time</h2>
            {summary.daily.length === 0 ? (
              <p className="admin-empty">No traffic recorded yet in this range.</p>
            ) : (
              <div className="admin-bar-chart">
                {summary.daily.map((d) => (
                  <div className="admin-bar-chart-col" key={d.date} title={`${d.date}: ${d.views} views, ${d.unique_visitors} unique`}>
                    <div className="admin-bar-chart-bar" style={{ height: `${(d.views / maxDaily) * 100}%` }} />
                    <span className="admin-bar-chart-label">{d.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-panel-grid">
            <div className="admin-panel">
              <h2>Top pages</h2>
              {summary.top_pages.length === 0 ? (
                <p className="admin-empty">No page views yet.</p>
              ) : (
                <ul className="admin-rank-list">
                  {summary.top_pages.map((p) => (
                    <li key={p.path}>
                      <span>{PAGE_LABELS[p.path] || p.path}</span>
                      <span className="admin-rank-value">{p.views}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="admin-panel">
              <h2>Referrers</h2>
              <ul className="admin-rank-list">
                <li><span>Direct / no referrer</span><span className="admin-rank-value">{summary.direct_views}</span></li>
                {summary.top_referrers.map((r) => (
                  <li key={r.domain}>
                    <span>{r.domain}</span>
                    <span className="admin-rank-value">{r.views}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="admin-panel">
              <h2>Devices</h2>
              <ul className="admin-rank-list">
                {summary.device_breakdown.map((d) => (
                  <li key={d.device_type}>
                    <span style={{ textTransform: "capitalize" }}>{d.device_type}</span>
                    <span className="admin-rank-value">{d.views}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="admin-panel">
              <h2>Language</h2>
              <ul className="admin-rank-list">
                {summary.lang_breakdown.map((l) => (
                  <li key={l.lang}>
                    <span>{l.lang === "en" ? "English" : l.lang === "es" ? "Español" : l.lang}</span>
                    <span className="admin-rank-value">{l.views}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
