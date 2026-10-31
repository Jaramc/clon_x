import {
  createContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import {
  loginUser,
  logoutUser,
  registerUser,
  loginWithGoogle,
} from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDoc(doc(db, 'users', firebaseUser.uid));

        setUser(
          snapshot.exists()
            ? { id: snapshot.id, uid: snapshot.id, ...snapshot.data() }
            : { id: firebaseUser.uid, uid: firebaseUser.uid, email: firebaseUser.email }
        );
      } catch (error) {
        console.error('Failed to load user profile from Firestore:', error);
        setUser({ id: firebaseUser.uid, uid: firebaseUser.uid, email: firebaseUser.email });
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,

      register: async (values) => {
        const next = await registerUser(values);
        setUser(next);
        return next;
      },

      login: async (identifier, password) => {
        const next = await loginUser(identifier, password);
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
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
