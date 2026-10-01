import { useState } from "react";
import { useAdminAuth } from "../AuthContext";
import { changePassword } from "../../api";

export default function AccountSettings() {
  const { admin } = useAdminAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const save = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", text: "New passwords don't match." });
      return;
    }

    setSaving(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setStatus({ type: "success", text: res.message || "Password changed." });
    } catch (err) {
      setStatus({ type: "error", text: err.message || "Could not change password." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Account</h1>
          <p className="admin-page-desc">
            Signed in as <strong>{admin?.username}</strong>
            {admin?.email ? ` (${admin.email})` : ""}. Change your admin password below.
          </p>
        </div>
      </div>
      <form className="admin-settings-form" onSubmit={save}>
        <div className="admin-field">
          <label>Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <div className="admin-field">
          <label>New Password (at least 8 characters)</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>
        <div className="admin-field">
          <label>Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>
        <div className="admin-actions">
          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Change Password"}
          </button>
          {status && <span className={`admin-status admin-status-${status.type}`}>{status.text}</span>}
        </div>
      </form>
    </div>
  );
}
