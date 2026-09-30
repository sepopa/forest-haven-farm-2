import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotUsername, forgotPassword } from "../api";
import "./admin.css";

// Two-step recovery: first (optionally) recover the username by email, then
// use that username — or an email — to request a password-reset link. Also
// available skipped straight to step 2 for someone who only forgot their password.
export default function ForgotPassword() {
  const [step, setStep] = useState("username"); // "username" | "password"

  const [email, setEmail] = useState("");
  const [usernameSubmitting, setUsernameSubmitting] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState(null);
  const [usernameError, setUsernameError] = useState(null);

  const [identifier, setIdentifier] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setUsernameError(null);
    setUsernameSubmitting(true);
    try {
      const res = await forgotUsername(email);
      setUsernameMessage(res.message);
    } catch (err) {
      setUsernameError(err.message || "Something went wrong.");
    } finally {
      setUsernameSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSubmitting(true);
    try {
      const res = await forgotPassword(identifier);
      setPasswordMessage(res.message);
    } catch (err) {
      setPasswordError(err.message || "Something went wrong.");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <div className="admin-auth-screen">
      <div className="admin-auth-card admin-auth-card-wide">
        <h1>Forest Haven Farm</h1>
        <p className="admin-auth-subtitle">Account recovery</p>

        <div className="admin-recovery-steps">
          <div className={`admin-recovery-step ${step === "username" ? "is-active" : "is-done"}`}>1. Find your username</div>
          <div className={`admin-recovery-step ${step === "password" ? "is-active" : ""}`}>2. Reset your password</div>
        </div>

        {step === "username" ? (
          <form onSubmit={handleUsernameSubmit} className="admin-recovery-form">
            <p className="admin-auth-hint">
              Don't remember your admin username? Enter the email on your account and we'll send it to you.
            </p>

            {!usernameMessage ? (
              <>
                <label>
                  Email
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
                </label>
                {usernameError && <div className="admin-error">{usernameError}</div>}
                <button type="submit" className="admin-btn admin-btn-primary" disabled={usernameSubmitting}>
                  {usernameSubmitting ? "Sending…" : "Email My Username"}
                </button>
              </>
            ) : (
              <div className="admin-status admin-status-success">{usernameMessage}</div>
            )}

            <div className="admin-auth-links">
              {usernameMessage && (
                <button type="button" className="admin-link-btn" onClick={() => setStep("password")}>
                  Continue to reset password →
                </button>
              )}
              {!usernameMessage && (
                <button type="button" className="admin-link-btn" onClick={() => setStep("password")}>
                  I already know my username — reset password instead
                </button>
              )}
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="admin-recovery-form">
            <p className="admin-auth-hint">
              Enter your admin username or email — if it matches our records, we'll send a link to set a new
              password.
            </p>

            {!passwordMessage ? (
              <>
                <label>
                  Username or Email
                  <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required autoFocus />
                </label>
                {passwordError && <div className="admin-error">{passwordError}</div>}
                <button type="submit" className="admin-btn admin-btn-primary" disabled={passwordSubmitting}>
                  {passwordSubmitting ? "Sending…" : "Send Reset Instructions"}
                </button>
              </>
            ) : (
              <div className="admin-status admin-status-success">{passwordMessage}</div>
            )}

            <div className="admin-auth-links">
              <button type="button" className="admin-link-btn" onClick={() => setStep("username")}>
                ← Back to find my username
              </button>
            </div>
          </form>
        )}

        <div className="admin-auth-links">
          <Link to="/admin/login" className="admin-link-btn">← Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}
