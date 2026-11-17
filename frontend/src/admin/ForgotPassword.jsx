import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api";
import "./admin.css";

// Admin sign-in is by email, so recovery is a single step: InsForge Auth emails
// a reset link that lands on /admin/reset-password.
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await forgotPassword(email);
      setMessage(res.message);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-auth-screen">
      <form className="admin-auth-card" onSubmit={handleSubmit}>
        <h1>Forest Haven Farm</h1>
        <p className="admin-auth-subtitle">Reset your password</p>

        {!message ? (
          <>
            <p className="admin-auth-hint">
              Enter the email you sign in with — if it matches the admin account, we'll send a link to set a new
              password.
            </p>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </label>
            {error && <div className="admin-error">{error}</div>}
            <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>
              {submitting ? "Sending…" : "Send Reset Link"}
            </button>
          </>
        ) : (
          <div className="admin-status admin-status-success">{message}</div>
        )}

        <div className="admin-auth-links">
          <Link to="/admin/login" className="admin-link-btn">← Back to Sign In</Link>
        </div>
      </form>
    </div>
  );
}
