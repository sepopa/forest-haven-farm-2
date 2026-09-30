import { Link } from "react-router-dom";
import PhotoTile from "../components/PhotoTile";
import { useLanguage } from "../i18n/LanguageContext";

export default function Process() {
  const { t, getList } = useLanguage();
  const processSteps = getList("process_steps");

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><Link to="/">{t("nav.home")}</Link> / {t("process.breadcrumb")}</div>
          <span className="eyebrow">{t("process.eyebrow")}</span>
          <h1>{t("process.h1")}</h1>
          <p className="lede">{t("process.lede")}</p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="grid-2" style={{ alignItems: "center", marginBottom: "3rem" }}>
            <PhotoTile
              style={{ aspectRatio: "4/3" }}
              src="/assets/photos/boule-detail-large.jpg"
              alt={t("process.photoAlt")}
              tag={t("process.photoTag")}
            />
            <div>
              <span className="eyebrow">{t("process.noShortcutsEyebrow")}</span>
              <h2>{t("process.whyH2")}</h2>
              <p className="lede mt-2">{t("process.whyText")}</p>
            </div>
          </div>

          <div className="section-head">
            <span className="eyebrow">{t("process.stepsEyebrow")}</span>
            <h2>{t("process.stepsH2")}</h2>
          </div>
          <div className="process-steps">
            {processSteps.map((step) => (
              <div className="process-step" key={step.title}>
                {/* number is rendered by the CSS counter on .step-num::before (see style.css) */}
                <div className="step-num"></div>
                <div>
                  <h3>{step.title}</h3>
                  <span className="step-meta">{step.meta}</span>
                  <p className="mt-2">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-dark">
        <div className="container text-center">
          <span className="eyebrow" style={{ color: "var(--wheat-light)" }}>{t("process.curiousEyebrow")}</span>
          <h2>{t("process.curiousH2")}</h2>
          <p className="lede" style={{ margin: "0 auto" }}>{t("process.curiousText")}</p>
          <div className="btn-row mt-2" style={{ justifyContent: "center" }}>
            <Link to="/menu" className="btn btn-primary">{t("process.viewMenu")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
