import { useState } from "react";
import { useAdminAuth } from "../AuthContext";
import { forgotPassword } from "../../api";

// InsForge Auth changes passwords through its emailed reset link, so this page
// sends one to the admin's own address instead of taking the new password here.
export default function AccountSettings() {
  const { admin } = useAdminAuth();
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);

  const sendReset = async () => {
    setStatus(null);
    setSending(true);
    try {
      await forgotPassword(admin.email);
      setStatus({ type: "success", text: `Check ${admin.email} for a link to set a new password.` });
    } catch (err) {
      setStatus({ type: "error", text: err.message || "Could not send the reset email." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Account</h1>
          <p className="admin-page-desc">
            Signed in as <strong>{admin?.username}</strong>
            {admin?.email ? ` (${admin.email})` : ""}.
          </p>
        </div>
      </div>
      <div className="admin-settings-form">
        <div className="admin-field">
          <label>Password</label>
          <p className="admin-page-desc">
            To change your password, we'll email you a secure link. Open it and choose a new password — you'll then
            sign in with it next time.
          </p>
        </div>
        <div className="admin-actions">
          <button type="button" className="admin-btn admin-btn-primary" onClick={sendReset} disabled={sending || !admin?.email}>
            {sending ? "Sending…" : "Email Me a Password Reset Link"}
          </button>
          {status && <span className={`admin-status admin-status-${status.type}`}>{status.text}</span>}
        </div>
      </div>
    </div>
  );
}
