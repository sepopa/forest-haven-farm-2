import { useEffect, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { updateContent } from "../../api";

const FIELDS = [
  { name: "businessName", label: "Business Name" },
  { name: "tagline", label: "Tagline (shown under the logo)" },
  { name: "address", label: "Street Address" },
  { name: "cityStateZip", label: "City, State ZIP" },
  { name: "phone", label: "Phone (displayed, e.g. \"(802) 555-0142\")" },
  { name: "phoneHref", label: "Phone (dialable, e.g. \"+18025550142\")" },
  { name: "email", label: "Email" },
  { name: "hoursShort", label: "Hours (short, shown in the footer)" },
  { name: "instagramUrl", label: "Instagram URL" },
  { name: "facebookUrl", label: "Facebook URL (leave blank to use the default handle link)" },
  { name: "twitterUrl", label: "Twitter / X URL (leave blank to use the default handle link)" },
];

export default function SettingsEditor() {
  const { settings, refreshContent } = useLanguage();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => setForm(settings), [settings]);

  const update = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      await updateContent("settings", null, form);
      await refreshContent();
      setStatus({ type: "success", text: "Saved." });
    } catch (err) {
      setStatus({ type: "error", text: err.message || "Save failed." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Business Info</h1>
          <p className="admin-page-desc">
            Contact details and business identity used across the header, footer, and Contact page. Not
            translated per-language — the same values show in English and Spanish.
          </p>
        </div>
      </div>
      <form className="admin-settings-form" onSubmit={save}>
        {FIELDS.map((field) => (
          <div className="admin-field" key={field.name}>
            <label>{field.label}</label>
            <input type="text" value={form[field.name] || ""} onChange={update(field.name)} />
          </div>
        ))}
        <div className="admin-actions">
          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {status && <span className={`admin-status admin-status-${status.type}`}>{status.text}</span>}
        </div>
      </form>
    </div>
  );
}
