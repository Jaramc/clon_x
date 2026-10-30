
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  deleteUser,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { validateRegistration, normalizeUsername } from "../lib/validators";
import {
  createUserProfile,
  getUserByUsername,
} from "./userService";

const googleProvider = new GoogleAuthProvider();

export async function getSession() {
  const currentUser = auth.currentUser;

  if (!currentUser) return null;

  const snapshot = await getDoc(doc(db, "users", currentUser.uid));

  return snapshot.exists()
    ? { id: snapshot.id, ...snapshot.data() }
    : null;
}

export async function registerUser(values) {
  const errors = validateRegistration(values);

  if (Object.keys(errors).length) {
    throw new Error(Object.values(errors)[0]);
  }

  let credential;

  try {
    credential = await createUserWithEmailAndPassword(
      auth,
      values.email.trim().toLowerCase(),
      values.password
    );

    return await createUserProfile(credential.user.uid, values);
  } catch (error) {
    if (credential?.user) {
      await deleteUser(credential.user).catch(() => {});
    }

    if (error.code === "auth/email-already-in-use") {
      throw new Error("Ese correo electrónico ya está registrado.");
    }

    if (error.code === "auth/weak-password") {
      throw new Error("La contraseña debe ser más segura.");
    }

    if (error.code === "permission-denied") {
      throw new Error(
        "Firebase no permite guardar el perfil. Revisa las reglas de Firestore."
      );
    }

    throw error;
  }
}

export async function loginUser(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    );

    const snapshot = await getDoc(
      doc(db, "users", credential.user.uid)
    );

    if (!snapshot.exists()) {
      throw new Error(
        "La cuenta existe, pero no tiene un perfil registrado en Firestore."
      );
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password"
    ) {
      throw new Error("Correo o contraseña incorrectos.");
    }

    throw error;
  }
}

export async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  const firebaseUser = credential.user;

  const snapshot = await getDoc(doc(db, "users", firebaseUser.uid));

  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }

  const email = firebaseUser.email || "";
  const baseUsername = normalizeUsername(
    email.split("@")[0] || "user"
  );

  let username = baseUsername;
  let suffix = 1;

  while (await getUserByUsername(username)) {
    username = `${baseUsername}${suffix}`;
    suffix += 1;
  }

  const profile = {
    username,
    email,
    name: firebaseUser.displayName || username,
  };

  const createdProfile = {
    username,
    usernameLower: normalizeUsername(username),
    email,
    name: profile.name,
    bio: "",
    avatar: profile.name.slice(0, 2).toUpperCase(),
    createdAt: new Date().toISOString(),
  };

  const { setDoc } = await import("firebase/firestore");

  await setDoc(doc(db, "users", firebaseUser.uid), createdProfile);

  return { id: firebaseUser.uid, ...createdProfile };
}

export async function logoutUser() {
  await signOut(auth);
}
