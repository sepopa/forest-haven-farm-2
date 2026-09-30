import { useState } from "react";
import { Link } from "react-router-dom";
import { IconPin, IconClock, IconMail, IconPhone, IconInstagram, IconFacebook, IconTwitter } from "../components/icons";
import { submitContact } from "../api";
import { useLanguage } from "../i18n/LanguageContext";

const initialForm = { name: "", email: "", subject: "", message: "" };

export default function Contact() {
  const { t, settings } = useLanguage();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      await submitContact(form);
      setStatus({ type: "success", text: t("contact.successMsg") });
      setForm(initialForm);
    } catch (err) {
      setStatus({ type: "error", text: t("contact.errorMsg") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><Link to="/">{t("nav.home")}</Link> / {t("contact.breadcrumb")}</div>
          <span className="eyebrow">{t("contact.eyebrow")}</span>
          <h1>{t("contact.h1")}</h1>
          <p className="lede">{t("contact.lede")}</p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="contact-grid">
            <div>
              <h2>{t("contact.detailsTitle")}</h2>
              <ul className="contact-info-list mt-2">
                <li><IconPin /><div><strong>{t("contact.farmStand")}</strong><span>{settings.address}, {settings.cityStateZip}</span></div></li>
                <li><IconClock /><div><strong>{t("contact.hoursTitle")}</strong><span>{t("contact.hoursText")}</span></div></li>
                <li><IconMail /><div><strong>{t("contact.emailTitle")}</strong><a href={`mailto:${settings.email}`}>{settings.email}</a></div></li>
                <li><IconPhone /><div><strong>{t("contact.phoneTitle")}</strong><a href={`tel:${settings.phoneHref}`}>{settings.phone}</a></div></li>
              </ul>
              <div className="map-placeholder"><IconPin /> {t("contact.mapPlaceholder")}</div>
              <div className="social-row">
                <a href={settings.instagramUrl || "https://www.instagram.com/foresthavenfarm/"} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><IconInstagram /></a>
                <a href={settings.facebookUrl || "https://www.facebook.com/foresthavenfarm"} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><IconFacebook /></a>
                <a href={settings.twitterUrl || "https://x.com/foresthavenfarm"} target="_blank" rel="noopener noreferrer" aria-label="Twitter"><IconTwitter /></a>
              </div>
            </div>

            <div className="form-card">
              <h2>{t("contact.sendMessageTitle")}</h2>
              <form onSubmit={handleSubmit} noValidate className="mt-2">
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="contact-name">{t("contact.fullName")}</label>
                    <input id="contact-name" required autoComplete="name" value={form.name} onChange={update("name")} />
                  </div>
                  <div className="field">
                    <label htmlFor="contact-email">{t("contact.email")}</label>
                    <input id="contact-email" type="email" required autoComplete="email" value={form.email} onChange={update("email")} />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="contact-subject">{t("contact.subject")}</label>
                  <select id="contact-subject" required value={form.subject} onChange={update("subject")}>
                    <option value="">{t("contact.selectTopic")}</option>
                    <option>{t("contact.topicOrder")}</option>
                    <option>{t("contact.topicCustom")}</option>
                    <option>{t("contact.topicWholesale")}</option>
                    <option>{t("contact.topicGeneral")}</option>
                    <option>{t("contact.topicOther")}</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="contact-message">{t("contact.message")}</label>
                  <textarea
                    id="contact-message"
                    required
                    placeholder={t("contact.messagePlaceholder")}
                    value={form.message}
                    onChange={update("message")}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                  {submitting ? t("contact.sending") : t("contact.send")}
                </button>
                {status && <div className={`form-msg show ${status.type}`} role="status">{status.text}</div>}
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
