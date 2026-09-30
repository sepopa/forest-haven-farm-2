import { createContext, useContext, useEffect, useState } from "react";
import { fetchMe, getToken, setToken as persistToken } from "../api";

const AuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(setAdmin)
      .catch(() => persistToken(null))
      .finally(() => setLoading(false));
  }, []);

  const signIn = (token) => {
    persistToken(token);
    return fetchMe().then(setAdmin);
  };

  const signOut = () => {
    persistToken(null);
    setAdmin(null);
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
