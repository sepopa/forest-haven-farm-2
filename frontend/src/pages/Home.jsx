import { Link } from "react-router-dom";
import PhotoTile from "../components/PhotoTile";
import { IconLeaf, IconWheat, IconClock, IconCheck, IconInstagram, IconArrow } from "../components/icons";
import { useLanguage } from "../i18n/LanguageContext";

export default function Home() {
  const { t, getList } = useLanguage();
  const galleryTiles = getList("gallery_tiles");

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-copy">
            <span className="eyebrow">{t("home.eyebrowHero")}</span>
            <h1>{t("home.h1")}</h1>
            <p className="lede">{t("home.lede")}</p>
            <div className="btn-row">
              <Link to="/menu" className="btn btn-primary">{t("home.viewMenu")}</Link>
              <Link to="/orders" className="btn btn-outline">{t("home.placeOrder")}</Link>
            </div>
            <div className="hero-stats">
              <div><strong>{t("home.statStarterYears")}</strong><span>{t("home.statStarterLabel")}</span></div>
              <div><strong>{t("home.statLoaves")}</strong><span>{t("home.statLoavesLabel")}</span></div>
              <div><strong>{t("home.statFerment")}</strong><span>{t("home.statFermentLabel")}</span></div>
            </div>
          </div>
          <div className="hero-art">
            <div className="art-frame">
              <PhotoTile
                className="hero-tile"
                tag={t("home.heroPhotoTag")}
                src="/assets/photos/boule-main-large.jpg"
                alt={t("home.heroPhotoAlt")}
                style={{ aspectRatio: "auto", height: "100%" }}
              />
            </div>
            <div className="badge-float">
              <IconLeaf />
              <div><strong>{t("home.badgeTitle")}</strong><span>{t("home.badgeSubtitle")}</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">{t("home.whyEyebrow")}</span>
            <h2>{t("home.whyH2")}</h2>
          </div>
          <div className="grid-3">
            <div className="card">
              <div className="icon-circle"><IconWheat /></div>
              <h3>{t("home.cardGrainTitle")}</h3>
              <p>{t("home.cardGrainText")}</p>
            </div>
            <div className="card">
              <div className="icon-circle"><IconClock /></div>
              <h3>{t("home.cardFermentTitle")}</h3>
              <p>{t("home.cardFermentText")}</p>
            </div>
            <div className="card">
              <div className="icon-circle"><IconLeaf /></div>
              <h3>{t("home.cardBatchTitle")}</h3>
              <p>{t("home.cardBatchText")}</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{t("home.reelEyebrow")}</span>
            <h2>{t("home.reelH2")}</h2>
          </div>
          <div className="reel-note">
            <IconCheck />
            <span>{t("home.reelNote")}</span>
          </div>
          <div className="reel-grid">
            {galleryTiles.map((tile, i) => (
              <PhotoTile
                key={i}
                className={tile.feature ? "tile-feature" : undefined}
                tag={tile.tag}
                label={tile.label}
                src={tile.src}
                alt={tile.alt}
                videoSrc={tile.videoSrc}
                poster={tile.poster}
              />
            ))}
          </div>
          <div className="follow-strip">
            <div>
              <h3>{t("home.followTitle")}</h3>
              <p>{t("home.followText")}</p>
            </div>
            <a
              href="https://www.instagram.com/foresthavenfarm/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-light"
            >
              <IconInstagram /> {t("home.followBtn")}
            </a>
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">{t("home.bestSellersEyebrow")}</span>
            <h2>{t("home.bestSellersH2")}</h2>
          </div>
          <div className="grid-3">
            <div className="card">
              <PhotoTile
                className="menu-thumb"
                style={{ aspectRatio: "16/10", marginBottom: "1.2rem" }}
                src="/assets/photos/boule-main-thumb.jpg"
                alt={t("home.boule.name")}
              />
              <h3>{t("home.boule.name")}</h3>
              <p>{t("home.boule.text")}</p>
              <p className="menu-price">{t("home.boule.price")}</p>
            </div>
            <div className="card">
              <PhotoTile className="menu-thumb" style={{ aspectRatio: "16/10", marginBottom: "1.2rem" }} gradient="linear-gradient(155deg, #8E9A6E, #4E5A3B)" />
              <h3>{t("home.focaccia.name")}</h3>
              <p>{t("home.focaccia.text")}</p>
              <p className="menu-price">{t("home.focaccia.price")}</p>
            </div>
            <div className="card">
              <PhotoTile
                className="menu-thumb"
                style={{ aspectRatio: "16/10", marginBottom: "1.2rem" }}
                src="/assets/photos/sesame-rolls-thumb.jpg"
                alt={t("home.rolls.name")}
              />
              <h3>{t("home.rolls.name")}</h3>
              <p>{t("home.rolls.text")}</p>
              <p className="menu-price">{t("home.rolls.price")}</p>
            </div>
          </div>
          <div className="text-center mt-2">
            <Link to="/menu" className="btn btn-primary">{t("home.seeFullMenu")} <IconArrow /></Link>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="grid-2" style={{ alignItems: "center" }}>
            <div className="testimonial-card">
              <p className="quote">{t("home.quote")}</p>
              <div className="testimonial-who">
                <div className="testimonial-avatar"></div>
                <div><strong>{t("home.quoteWho")}</strong><span>{t("home.quoteWhere")}</span></div>
              </div>
            </div>
            <div>
              <span className="eyebrow">{t("home.readyEyebrow")}</span>
              <h2>{t("home.readyH2")}</h2>
              <p className="lede mt-2">{t("home.readyText")}</p>
              <div className="btn-row mt-2">
                <Link to="/orders" className="btn btn-primary">{t("home.placeOrder")} <IconArrow /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
