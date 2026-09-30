import { useRef, useState } from "react";
import { uploadFile } from "../../api";

// A URL text field plus an "Upload" button that fills it in — used for any
// photo/video field on menu items, gallery tiles, etc.
export default function ImagePicker({ label, value, onChange, accept = "image/*" }) {
  const fileInput = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadFile(file);
      onChange(url);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <div className="admin-field">
      <label>{label}</label>
      <div className="admin-image-picker">
        <input
          type="text"
          placeholder="Image/video URL, or upload a file →"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="admin-btn admin-btn-ghost"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
        <input ref={fileInput} type="file" accept={accept} hidden onChange={handleFile} />
      </div>
      {error && <div className="admin-error">{error}</div>}
      {value && accept.startsWith("image") && (
        <img src={value} alt="" className="admin-image-preview" />
      )}
    </div>
  );
}
