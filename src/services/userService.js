
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../lib/firebase";
import { normalizeUsername } from "../lib/validators";

const USERS_COLLECTION = "users";

export async function getUserById(id) {
  const snapshot = await getDoc(
    doc(db, USERS_COLLECTION, id)
  );

  return snapshot.exists()
    ? { id: snapshot.id, ...snapshot.data() }
    : null;
}

export async function getUserByUsername(username) {
  if (!auth.currentUser) {
    throw new Error("Debes iniciar sesión.");
  }

  const normalized = normalizeUsername(username);

  const usersQuery = query(
    collection(db, USERS_COLLECTION),
    where("usernameLower", "==", normalized)
  );

  const snapshot = await getDocs(usersQuery);

  if (snapshot.empty) return null;

  const userDoc = snapshot.docs[0];

  return {
    id: userDoc.id,
    ...userDoc.data(),
  };
}

export async function getUsers() {
  if (!auth.currentUser) {
    throw new Error("Debes iniciar sesión.");
  }

  const snapshot = await getDocs(
    collection(db, USERS_COLLECTION)
  );

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

export async function createUserProfile(uid, values) {
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    throw new Error("No tienes permiso para crear este perfil.");
  }

  const username = values.username.trim().replace(/^@/, "");
  const usernameLower = normalizeUsername(username);

  const existingUser = await getUserByUsername(usernameLower);

  if (existingUser) {
    throw new Error("Ese nombre de usuario ya está registrado.");
  }

  const profile = {
    username,
    usernameLower,
    name: (values.name || username).trim(),
    email: values.email.trim().toLowerCase(),
    bio: "",
    avatar: (values.name || username)
      .trim()
      .slice(0, 2)
      .toUpperCase(),
    createdAt: new Date().toISOString(),
  };

  await setDoc(
    doc(db, USERS_COLLECTION, uid),
    profile
  );

  return {
    id: uid,
    ...profile,
  };
}
