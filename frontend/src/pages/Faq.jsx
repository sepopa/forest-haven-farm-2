import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

function FaqAccordionItem({ q, a, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`faq-item${open ? " open" : ""}`}>
      <button className="faq-question" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span>{q}</span>
        <span className="plus"></span>
      </button>
      <div className="faq-answer">
        <p>{a}</p>
      </div>
    </div>
  );
}

export default function Faq() {
  const { t, getList } = useLanguage();
  const faqItems = getList("faq_items");

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><Link to="/">{t("nav.home")}</Link> / {t("faq.breadcrumb")}</div>
          <span className="eyebrow">{t("faq.eyebrow")}</span>
          <h1>{t("faq.h1")}</h1>
          <p className="lede">{t("faq.lede")}</p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="faq-list">
            {faqItems.map((item, i) => (
              <FaqAccordionItem key={item.q} q={item.q} a={item.a} defaultOpen={i === 0} />
            ))}
          </div>
          <div className="text-center mt-2">
            <p className="lede" style={{ margin: "0 auto 1.2rem" }}>{t("faq.stillQuestion")}</p>
            <Link to="/contact" className="btn btn-primary">{t("faq.contactUs")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
