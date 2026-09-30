import { useEffect, useRef, useState } from "react";
import { deleteUpload, listUploads, uploadFile } from "../../api";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibrary() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);
  const fileInput = useRef(null);

  const load = () => {
    setLoading(true);
    listUploads()
      .then(setFiles)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleUpload = async (e) => {
    const chosen = Array.from(e.target.files || []);
    if (chosen.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of chosen) {
        await uploadFile(file);
      }
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm("Delete this file? Any page still referencing its URL will show a broken image.")) return;
    try {
      await deleteUpload(filename);
      setFiles((prev) => prev.filter((f) => f.filename !== filename));
    } catch (err) {
      setError(err.message);
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(url);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Media Library</h1>
          <p className="admin-page-desc">
            Every photo/video uploaded from any editor. Upload here to grab a URL for later, or manage what's
            already on the server.
          </p>
        </div>
      </div>

      <div className="admin-actions">
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => fileInput.current?.click()} disabled={uploading}>
          {uploading ? "Uploading…" : "Upload Files"}
        </button>
        <input ref={fileInput} type="file" accept="image/*,video/mp4" multiple hidden onChange={handleUpload} />
      </div>
      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <p>Loading…</p>
      ) : files.length === 0 ? (
        <p className="admin-empty">No uploads yet.</p>
      ) : (
        <div className="admin-media-grid">
          {files.map((f) => (
            <div className="admin-media-card" key={f.filename}>
              {f.filename.match(/\.mp4$/i) ? (
                <video src={f.url} muted className="admin-media-thumb" />
              ) : (
                <img src={f.url} alt="" className="admin-media-thumb" />
              )}
              <div className="admin-media-meta">
                <span>{formatBytes(f.size)}</span>
                <div className="admin-media-actions">
                  <button type="button" className="admin-btn-icon" onClick={() => copyUrl(f.url)} title="Copy URL">
                    {copied === f.url ? "✓" : "⧉"}
                  </button>
                  <button type="button" className="admin-btn-icon admin-btn-danger" onClick={() => handleDelete(f.filename)} title="Delete">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
