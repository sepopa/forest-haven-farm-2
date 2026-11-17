import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authStatus, login as apiLogin, signup as apiSignup } from "../api";
import { useAdminAuth } from "./AuthContext";
import "./admin.css";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated } = useAdminAuth();
  const [mode, setMode] = useState(null); // "signup" | "login"
  const [setupRequired, setSetupRequired] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin", { replace: true });
      return;
    }
    authStatus()
      .then((res) => {
        setSetupRequired(res.setup_required);
        setMode(res.setup_required ? "signup" : "login");
      })
      .catch(() => setMode("login"));
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    setNotice(null);
    try {
      if (mode === "signup") {
        const result = await apiSignup(username, email, password);
        if (result.verifyEmail) {
          // InsForge wants the address confirmed first — the admin role is
          // claimed on the first successful login afterwards.
          setNotice("Account created! Check your email to confirm it, then sign in here.");
          setPassword("");
          setConfirmPassword("");
          setMode("login");
          return;
        }
        signIn(result.admin);
      } else {
        signIn(await apiLogin(email, password));
      }
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === null) {
    return <div className="admin-loading">Loading…</div>;
  }

  return (
    <div className="admin-auth-screen">
      <form className="admin-auth-card" onSubmit={handleSubmit}>
        <h1>Forest Haven Farm</h1>
        <p className="admin-auth-subtitle">
          {mode === "signup" ? "Create the admin account" : "Sign in to the admin panel"}
        </p>

        {mode === "signup" && (
          <p className="admin-auth-hint">
            {setupRequired
              ? "This is a one-time setup — the first account created here becomes the site's only admin login. You'll sign in with this email from now on."
              : "An admin account already exists — signing up again isn't possible. Please log in instead."}
          </p>
        )}

        {mode === "signup" && (
          <label>
            Display Name
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="nickname"
              required
              minLength={3}
            />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete={mode === "signup" ? "email" : "username"}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={8}
          />
        </label>
        {mode === "signup" && (
          <label>
            Confirm Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
          </label>
        )}

        {notice && <div className="admin-status admin-status-success">{notice}</div>}
        {error && <div className="admin-error">{error}</div>}

        <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>
          {submitting ? "Please wait…" : mode === "signup" ? "Create Account" : "Sign In"}
        </button>

        <div className="admin-auth-links">
          {mode === "login" ? (
            <button type="button" className="admin-link-btn" onClick={() => { setError(null); setMode("signup"); }}>
              Don't have an account? Sign up
            </button>
          ) : (
            <button type="button" className="admin-link-btn" onClick={() => { setError(null); setMode("login"); }}>
              Already have an account? Log in
            </button>
          )}
          {mode === "login" && (
            <Link to="/admin/forgot-password" className="admin-link-btn">
              Forgot your password?
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
