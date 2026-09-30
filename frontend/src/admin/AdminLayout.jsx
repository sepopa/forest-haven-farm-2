import { NavLink, Outlet, Link } from "react-router-dom";
import { useAdminAuth } from "./AuthContext";
import "./admin.css";

const NAV_ITEMS = [
  { to: "/admin", end: true, label: "Dashboard & SEO" },
  { to: "/admin/pages", label: "Page Copy" },
  { to: "/admin/menu", label: "Menu" },
  { to: "/admin/faq", label: "FAQ" },
  { to: "/admin/history", label: "History Timeline" },
  { to: "/admin/process", label: "Process Steps" },
  { to: "/admin/gallery", label: "Gallery" },
  { to: "/admin/settings", label: "Business Info" },
  { to: "/admin/media", label: "Media Library" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/pickup-dates", label: "Pickup Dates" },
  { to: "/admin/parameters", label: "Parameters" },
  { to: "/admin/messages", label: "Messages" },
];

export default function AdminLayout() {
  const { admin, signOut } = useAdminAuth();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <Link to="/admin">Forest Haven Admin</Link>
        </div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="admin-nav-link">
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/" target="_blank" className="admin-view-site">View live site ↗</Link>
          <div className="admin-account">
            <span>{admin?.username}</span>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={signOut}>
              Sign Out
            </button>
          </div>
        </div>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
