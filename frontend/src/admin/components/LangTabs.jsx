export default function LangTabs({ lang, onChange }) {
  return (
    <div className="admin-lang-tabs">
      <button type="button" className={lang === "en" ? "is-active" : ""} onClick={() => onChange("en")}>
        🇬🇧 English
      </button>
      <button type="button" className={lang === "es" ? "is-active" : ""} onClick={() => onChange("es")}>
        🇪🇸 Español
      </button>
    </div>
  );
}
