import { useEffect, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { updateContent } from "../../api";
import LangTabs from "../components/LangTabs";

const NAMESPACES = [
  { key: "nav", label: "Navigation" },
  { key: "footer", label: "Footer" },
  { key: "home", label: "Home Page" },
  { key: "menu", label: "Menu Page (intro copy)" },
  { key: "history", label: "History Page" },
  { key: "process", label: "Process Page" },
  { key: "orders", label: "Orders Page" },
  { key: "faq", label: "FAQ Page (intro copy)" },
  { key: "contact", label: "Contact Page" },
];

function humanizeKey(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

function setAtPath(obj, path, value) {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (Array.isArray(obj)) {
    const next = [...obj];
    next[head] = setAtPath(obj[head], rest, value);
    return next;
  }
  return { ...obj, [head]: setAtPath(obj[head], rest, value) };
}

// Renders inputs for every leaf in a namespace's value tree, however deep,
// and reports edits back up via onChange(path, value).
function NodeEditor({ node, path, onChange }) {
  if (Array.isArray(node)) {
    return (
      <div className="admin-field-wide">
        {node.map((item, i) => (
          <div className="admin-field" key={i}>
            <label>{`Item ${i + 1}`}</label>
            <input type="text" value={item} onChange={(e) => onChange([...path, i], e.target.value)} />
          </div>
        ))}
      </div>
    );
  }
  if (node !== null && typeof node === "object") {
    return (
      <fieldset className="admin-namespace-group">
        {Object.entries(node).map(([key, value]) => (
          <div key={key}>
            <div className="admin-namespace-group-label">{humanizeKey(key)}</div>
            <NodeEditor node={value} path={[...path, key]} onChange={onChange} />
          </div>
        ))}
      </fieldset>
    );
  }
  const isLong = typeof node === "string" && node.length > 70;
  return (
    <div className="admin-field admin-field-wide">
      {isLong ? (
        <textarea value={node ?? ""} onChange={(e) => onChange(path, e.target.value)} rows={3} />
      ) : (
        <input type="text" value={node ?? ""} onChange={(e) => onChange(path, e.target.value)} />
      )}
    </div>
  );
}

export default function PagesEditor() {
  const { content, refreshContent } = useLanguage();
  const [lang, setLang] = useState("en");
  const [namespace, setNamespace] = useState("home");
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    setDraft(content?.strings?.[lang]?.[namespace] ?? null);
    // Deliberately not touching `status` here — saving triggers a content
    // refetch (so this effect re-runs), and clearing status on every
    // refetch would wipe the "Saved." message right after save() sets it.
  }, [content, lang, namespace]);

  useEffect(() => {
    setStatus(null);
  }, [lang, namespace]);

  const handleChange = (path, value) => {
    setDraft((prev) => setAtPath(prev, path, value));
  };

  const save = async () => {
    if (!content?.strings?.[lang]) return;
    setSaving(true);
    setStatus(null);
    try {
      const fullStringsForLang = { ...content.strings[lang], [namespace]: draft };
      await updateContent("strings", lang, fullStringsForLang);
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
          <h1>Page Copy</h1>
          <p className="admin-page-desc">
            Headings, buttons, and body text across the site, grouped by page. Menu items, FAQ answers,
            history milestones, process steps, and gallery captions have their own editors in the sidebar.
          </p>
        </div>
        <LangTabs lang={lang} onChange={setLang} />
      </div>

      <div className="admin-namespace-tabs">
        {NAMESPACES.map((ns) => (
          <button
            key={ns.key}
            type="button"
            className={namespace === ns.key ? "is-active" : ""}
            onClick={() => setNamespace(ns.key)}
          >
            {ns.label}
          </button>
        ))}
      </div>

      {draft && (
        <>
          <div className="admin-namespace-form">
            <NodeEditor node={draft} path={[]} onChange={handleChange} />
          </div>
          <div className="admin-actions">
            <button type="button" className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
            {status && <span className={`admin-status admin-status-${status.type}`}>{status.text}</span>}
          </div>
        </>
      )}
    </div>
  );
}
