import { useEffect, useState } from "react";
import { listContactMessages, updateContactStatus } from "../../api";

const STATUSES = ["new", "replied"];

export default function MessagesInbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    listContactMessages()
      .then(setMessages)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const changeStatus = async (id, status) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    try {
      await updateContactStatus(id, status);
    } catch (err) {
      setError(err.message);
      load();
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Messages</h1>
          <p className="admin-page-desc">Contact form submissions, newest first.</p>
        </div>
      </div>
      {error && <div className="admin-error">{error}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : messages.length === 0 ? (
        <p className="admin-empty">No messages yet.</p>
      ) : (
        <div className="admin-message-list">
          {messages.map((m) => (
            <div className="admin-message-card" key={m.id}>
              <div className="admin-message-head">
                <div>
                  <strong>{m.name}</strong> <span className="admin-table-sub">{m.email}</span>
                </div>
                <select value={m.status} onChange={(e) => changeStatus(m.id, e.target.value)}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="admin-message-subject">{m.subject} · {new Date(m.created_at).toLocaleString()}</div>
              <p>{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
