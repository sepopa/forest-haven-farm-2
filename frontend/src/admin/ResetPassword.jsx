import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api";
import "./admin.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate("/admin/login", { replace: true }), 2000);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="admin-auth-screen">
        <div className="admin-auth-card">
          <h1>Forest Haven Farm</h1>
          <div className="admin-error">This reset link is missing its token. Request a new one.</div>
          <div className="admin-auth-links">
            <Link to="/admin/forgot-password" className="admin-link-btn">Request a new reset link</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-auth-screen">
      <form className="admin-auth-card" onSubmit={handleSubmit}>
        <h1>Forest Haven Farm</h1>
        <p className="admin-auth-subtitle">Set a new password</p>

        {done ? (
          <div className="admin-status admin-status-success">Password reset — redirecting you to sign in…</div>
        ) : (
          <>
            <label>
              New Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </label>
            <label>
              Confirm New Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </label>
            {error && <div className="admin-error">{error}</div>}
            <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>
              {submitting ? "Please wait…" : "Reset Password"}
            </button>
          </>
        )}

        <div className="admin-auth-links">
          <Link to="/admin/login" className="admin-link-btn">← Back to Sign In</Link>
        </div>
      </form>
    </div>
  );
}
