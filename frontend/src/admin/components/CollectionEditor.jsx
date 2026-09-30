import { useEffect, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { updateContent } from "../../api";
import LangTabs from "./LangTabs";
import ImagePicker from "./ImagePicker";

// Generic list-of-objects editor: add / remove / reorder / edit fields, with
// an EN/ES tab since every collection in this site is per-language. `fields`
// describes the form for one item; `contentKey` is the backend content key.
// A field's `options` may be a static array or a `(content, lang) => array`
// function, for dropdowns sourced from another collection (e.g. categories
// pulled live from menu_filters). `transformBeforeSave(items, lang)` — if
// given — runs right before saving, for derived/auto-generated fields.
export default function CollectionEditor({
  contentKey,
  title,
  description,
  fields,
  blankItem,
  itemTitle,
  addLabel,
  transformBeforeSave,
}) {
  const { content, refreshContent } = useLanguage();
  const [lang, setLang] = useState("en");
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const source = content?.[contentKey]?.[lang] ?? [];
    setItems(structuredClone(source));
    // Deliberately not touching `status` here — saving triggers a content
    // refetch (so this effect re-runs), and clearing status on every
    // refetch would wipe the "Saved." message right after save() sets it.
  }, [content, contentKey, lang]);

  useEffect(() => {
    setStatus(null);
  }, [lang]);

  const updateField = (index, name, value) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [name]: value } : item)));
  };

  const addItem = () => setItems((prev) => [...prev, structuredClone(blankItem)]);
  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));
  const moveItem = (index, dir) => {
    setItems((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const toSave = transformBeforeSave ? transformBeforeSave(items, lang, content) : items;
      await updateContent(contentKey, lang, toSave);
      setItems(toSave);
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
          <h1>{title}</h1>
          {description && <p className="admin-page-desc">{description}</p>}
        </div>
        <LangTabs lang={lang} onChange={setLang} />
      </div>

      <div className="admin-collection">
        {items.map((item, index) => (
          <div className="admin-collection-item" key={index}>
            <div className="admin-collection-item-head">
              <strong>{itemTitle ? itemTitle(item, index) : `Item ${index + 1}`}</strong>
              <div className="admin-collection-item-actions">
                <button type="button" className="admin-btn-icon" onClick={() => moveItem(index, -1)} disabled={index === 0} title="Move up">↑</button>
                <button type="button" className="admin-btn-icon" onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} title="Move down">↓</button>
                <button type="button" className="admin-btn-icon admin-btn-danger" onClick={() => removeItem(index)} title="Remove">✕</button>
              </div>
            </div>
            <div className="admin-collection-item-fields">
              {fields.map((field) => {
                const resolvedField =
                  typeof field.options === "function"
                    ? { ...field, options: field.options(content, lang) }
                    : field;
                return (
                  <FieldInput
                    key={field.name}
                    field={resolvedField}
                    value={item[field.name]}
                    onChange={(v) => updateField(index, field.name, v)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="admin-actions">
        <button type="button" className="admin-btn admin-btn-ghost" onClick={addItem}>+ {addLabel || `Add to ${title}`}</button>
        <button type="button" className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
        {status && <span className={`admin-status admin-status-${status.type}`}>{status.text}</span>}
      </div>
    </div>
  );
}

function FieldInput({ field, value, onChange }) {
  if (field.type === "image" || field.type === "video") {
    return (
      <ImagePicker
        label={field.label}
        value={value}
        onChange={onChange}
        accept={field.type === "video" ? "video/*" : "image/*"}
      />
    );
  }
  if (field.type === "textarea") {
    return (
      <div className="admin-field admin-field-wide">
        <label>{field.label}</label>
        <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={3} />
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <div className="admin-field">
        <label>{field.label}</label>
        <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  }
  if (field.type === "checkbox") {
    return (
      <div className="admin-field admin-field-checkbox">
        <label>
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          {field.label}
        </label>
      </div>
    );
  }
  return (
    <div className="admin-field">
      <label>{field.label}</label>
      <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
