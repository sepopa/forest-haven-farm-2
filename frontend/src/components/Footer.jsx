import { Link } from "react-router-dom";
import { IconInstagram, IconFacebook, IconTwitter } from "./icons";
import { useLanguage } from "../i18n/LanguageContext";

export default function Footer() {
  const { t, settings } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <Link to="/" className="footer-brand">
              <img
                className="logo-mark"
                src="/assets/logo/logo-icon-white.png"
                alt="Forest Haven Farm barn and bread logo"
                width="140"
                height="94"
              />
              <span>{settings.businessName}</span>
            </Link>
            <p>{t("footer.tagline")}</p>
            <div className="social-row">
              <a
                href={settings.instagramUrl || "https://www.instagram.com/foresthavenfarm/"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <IconInstagram />
              </a>
              <a
                href={settings.facebookUrl || "https://www.facebook.com/foresthavenfarm"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <IconFacebook />
              </a>
              <a
                href={settings.twitterUrl || "https://x.com/foresthavenfarm"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <IconTwitter />
              </a>
            </div>
          </div>
          <div className="footer-col">
            <h4>{t("footer.explore")}</h4>
            <ul>
              <li><Link to="/menu">{t("nav.menu")}</Link></li>
              <li><Link to="/history">{t("footer.ourHistory")}</Link></li>
              <li><Link to="/process">{t("footer.ourProcess")}</Link></li>
              <li><Link to="/orders">{t("footer.orderBread")}</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{t("footer.support")}</h4>
            <ul>
              <li><Link to="/faq">{t("nav.faq")}</Link></li>
              <li><Link to="/contact">{t("footer.contactUs")}</Link></li>
              <li><Link to="/orders">{t("footer.pickupPolicy")}</Link></li>
              <li><Link to="/admin">{t("footer.adminLogin")}</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{t("footer.visit")}</h4>
            <ul>
              <li>{settings.address}<br />{settings.cityStateZip}</li>
              <li>{settings.hoursShort}</li>
              <li><a href={`mailto:${settings.email}`}>{settings.email}</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{t("footer.rights")}</span>
          <span>{t("footer.placeholderNote")}</span>
        </div>
      </div>
    </footer>
  );
}
