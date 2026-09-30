import { Link } from "react-router-dom";
import PhotoTile from "../components/PhotoTile";
import { IconLeaf, IconClock, IconBread } from "../components/icons";
import { useLanguage } from "../i18n/LanguageContext";

export default function History() {
  const { t, getList } = useLanguage();
  const timeline = getList("history_timeline");

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><Link to="/">{t("nav.home")}</Link> / {t("history.breadcrumb")}</div>
          <span className="eyebrow">{t("history.eyebrow")}</span>
          <h1>{t("history.h1")}</h1>
          <p className="lede">{t("history.lede")}</p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="grid-2" style={{ alignItems: "start" }}>
            <div>
              <span className="eyebrow">{t("history.howStartedEyebrow")}</span>
              <h2>{t("history.howStartedH2")}</h2>
              <p className="lede mt-2">{t("history.p1")}</p>
              <p className="lede mt-2">{t("history.p2")}</p>
            </div>
            <PhotoTile
              style={{ aspectRatio: "4/5" }}
              src="/assets/photos/mini-boules-large.jpg"
              alt={t("history.photoAlt")}
              tag={t("history.photoTag")}
            />
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{t("history.milestonesEyebrow")}</span>
            <h2>{t("history.milestonesH2")}</h2>
          </div>
          <div className="timeline">
            {timeline.map((item) => (
              <div className="timeline-item" key={item.year}>
                <span className="timeline-year">{item.year}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">{t("history.valuesEyebrow")}</span>
            <h2>{t("history.valuesH2")}</h2>
          </div>
          <div className="grid-3">
            <div className="card">
              <div className="icon-circle"><IconLeaf /></div>
              <h3>{t("history.valueGrownTitle")}</h3>
              <p>{t("history.valueGrownText")}</p>
            </div>
            <div className="card">
              <div className="icon-circle"><IconClock /></div>
              <h3>{t("history.valueSlowTitle")}</h3>
              <p>{t("history.valueSlowText")}</p>
            </div>
            <div className="card">
              <div className="icon-circle"><IconBread /></div>
              <h3>{t("history.valueNeighborsTitle")}</h3>
              <p>{t("history.valueNeighborsText")}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
