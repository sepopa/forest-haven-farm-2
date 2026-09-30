import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { lang, setLang, t, settings } = useLanguage();

  const NAV_ITEMS = [
    { to: "/", label: t("nav.home"), end: true },
    { to: "/menu", label: t("nav.menu") },
    { to: "/history", label: t("nav.history") },
    { to: "/process", label: t("nav.process") },
    { to: "/orders", label: t("nav.orders") },
    { to: "/faq", label: t("nav.faq") },
    { to: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className="site-header">
      <div className="container">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <img
            className="logo-mark"
            src="/assets/logo/logo-icon.png"
            alt="Forest Haven Farm barn and bread logo"
            width="140"
            height="94"
          />
          <span className="brand-text">
            {settings.businessName}
            <span>{settings.tagline}</span>
          </span>
        </Link>

        <nav className={`main-nav${open ? " open" : ""}`} id="main-nav">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                {/* react-router's NavLink sets aria-current="page" automatically
                    when active — style.css already targets a[aria-current="page"] */}
                <NavLink to={item.to} end={item.end} onClick={() => setOpen(false)}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-cta">
          <div className="lang-switch" role="group" aria-label="Language / Idioma">
            <button
              type="button"
              className={`lang-flag${lang === "en" ? " is-active" : ""}`}
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
              aria-label="English"
              title="English"
            >
              🇬🇧
            </button>
            <button
              type="button"
              className={`lang-flag${lang === "es" ? " is-active" : ""}`}
              onClick={() => setLang("es")}
              aria-pressed={lang === "es"}
              aria-label="Español"
              title="Español"
            >
              🇪🇸
            </button>
          </div>
          <Link to="/orders" className="btn btn-outline">
            {t("nav.placeOrder")}
          </Link>
          <button
            className="nav-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="main-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
