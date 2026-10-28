import { createContext, useEffect, useMemo, useState } from "react";
import { getSession, loginUser, logoutUser, registerUser, loginWithGoogle } from "../services/authService";
export const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSession());
  useEffect(() => {
    const refresh = () => setUser(getSession());
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);
  const value = useMemo(() => ({
    user,
    register: (values) => { const next = registerUser(values); setUser(next); return next; },
    login: (username, password) => { const next = loginUser(username, password); setUser(next); return next; },
    loginGoogle: async () => { const next = await loginWithGoogle(); setUser(next); return next; },
    logout: () => { logoutUser(); setUser(null); }
  }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
