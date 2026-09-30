import { useState } from "react";
import { Link } from "react-router-dom";
import PhotoTile from "../components/PhotoTile";
import { useLanguage } from "../i18n/LanguageContext";

export default function Menu() {
  const [filter, setFilter] = useState("all");
  const { t, getList } = useLanguage();
  const menuItems = getList("menu_items");
  const menuFilters = getList("menu_filters");
  const visibleItems = filter === "all" ? menuItems : menuItems.filter((item) => item.category === filter);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><Link to="/">{t("nav.home")}</Link> / {t("menu.breadcrumb")}</div>
          <span className="eyebrow">{t("menu.eyebrow")}</span>
          <h1>{t("menu.h1")}</h1>
          <p className="lede">{t("menu.lede")}</p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="menu-filters">
            {menuFilters.map((f) => (
              <button
                key={f.id}
                className={`filter-pill${filter === f.id ? " is-active" : ""}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="menu-list">
            {visibleItems.map((item) => (
              <div className="menu-item" key={item.id}>
                <PhotoTile className="menu-thumb" gradient={item.gradient} src={item.photo} alt={item.name} />
                <div className="menu-info">
                  <h3>{item.name} <span className="menu-tag">{item.tag}</span></h3>
                  <p>{item.description}</p>
                </div>
                <div className="menu-price">{item.price}</div>
              </div>
            ))}
          </div>

          <div className="menu-note">
            <strong>{t("menu.noteGoodToKnow")}</strong> {t("menu.note")}{" "}
            <Link to="/orders">{t("menu.noteOrdersLink")}</Link>.
          </div>

          <div className="text-center mt-2">
            <Link to="/orders" className="btn btn-primary">{t("menu.orderFromMenu")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
