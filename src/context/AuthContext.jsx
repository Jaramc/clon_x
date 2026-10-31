
<<<<<<< HEAD
import { createContext, useState } from 'react';
=======
import {
  createContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import {
  loginUser,
  logoutUser,
  registerUser,
  loginWithGoogle,
} from "../services/authService";
>>>>>>> origin/feature/spa

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
<<<<<<< HEAD

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, logout }}
    >
=======
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDoc(
          doc(db, "users", firebaseUser.uid)
        );

        setUser(
          snapshot.exists()
            ? { id: snapshot.id, ...snapshot.data() }
            : null
        );
      } catch (error) {
        console.error("Failed to load user profile:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,

      register: async (values) => {
        const next = await registerUser(values);
        setUser(next);
        return next;
      },

      login: async (email, password) => {
        const next = await loginUser(email, password);
        setUser(next);
        return next;
      },

      loginGoogle: async () => {
        const next = await loginWithGoogle();
        setUser(next);
        return next;
      },

      logout: async () => {
        await logoutUser();
        setUser(null);
      },
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
>>>>>>> origin/feature/spa
      {children}
    </AuthContext.Provider>
  );
}
