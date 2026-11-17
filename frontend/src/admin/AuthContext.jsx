import { createContext, useContext, useEffect, useState } from "react";
import { fetchMe, logout } from "../api";

const AuthContext = createContext(null);

// InsForge keeps the session itself (short-lived access token in memory plus a
// refresh cookie), so there's no token to store here — on load we just ask
// who's signed in and whether they're the site admin.
export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMe()
      .then(setAdmin)
      .catch(() => setAdmin(null))
      .finally(() => setLoading(false));
  }, []);

  const signIn = (adminProfile) => {
    setAdmin(adminProfile);
  };

  const signOut = async () => {
    try {
      await logout();
    } finally {
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider value={{ admin, loading, isAuthenticated: !!admin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return ctx;
}
