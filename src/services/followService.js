
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../lib/firebase";
import { getUserByUsername, getUsers } from "./userService";

const FOLLOWS_COLLECTION = "follows";

function getAuthenticatedUserId() {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error("Debes iniciar sesión.");
  }

  return userId;
}

async function getFollowDocuments(field, userId) {
  getAuthenticatedUserId();

  const followsQuery = query(
    collection(db, FOLLOWS_COLLECTION),
    where(field, "==", userId)
  );

  const snapshot = await getDocs(followsQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// Obtener los identificadores de las personas que sigo.
export async function getFollowingIds(userId) {
  const authenticatedId = getAuthenticatedUserId();

  const follows = await getFollowDocuments(
    "followerId",
    authenticatedId
  );

  return [
    ...new Set(
      follows
        .map((item) => item.followingId)
        .filter(Boolean)
    ),
  ];
}

// Obtener los identificadores de mis seguidores.
export async function getFollowerIds(userId) {
  const authenticatedId = getAuthenticatedUserId();

  const follows = await getFollowDocuments(
    "followingId",
    authenticatedId
  );

  return [
    ...new Set(
      follows
        .map((item) => item.followerId)
        .filter(Boolean)
    ),
  ];
}

// Obtener los perfiles de las personas que sigo.
export async function getFollowingUsers(userId) {
  const ids = await getFollowingIds(userId);
  const users = await getUsers();

  return users.filter((user) => ids.includes(user.id));
}

// Obtener los perfiles de mis seguidores.
export async function getFollowerUsers(userId) {
  const ids = await getFollowerIds(userId);
  const users = await getUsers();

  return users.filter((user) => ids.includes(user.id));
}

// Seguir a un usuario por su nombre de usuario.
export async function followByUsername(currentUser, username) {
  const followerId = getAuthenticatedUserId();

  const target = await getUserByUsername(username);

  if (!target) {
    throw new Error("No encontramos un usuario con ese nombre.");
  }

  if (target.id === followerId) {
    throw new Error("No puedes seguirte a ti mismo.");
  }

  const followId = `${followerId}_${target.id}`;

  const followRef = doc(
    db,
    FOLLOWS_COLLECTION,
    followId
  );

  const existingDoc = await getDoc(followRef);

  if (existingDoc.exists()) {
    throw new Error("Ya sigues a este usuario.");
  }

  await setDoc(followRef, {
    followerId,
    followingId: target.id,
    createdAt: new Date().toISOString(),
  });

  return target;
}

// Dejar de seguir a un usuario.
export async function unfollowUser(currentUser, targetId) {
  const followerId = getAuthenticatedUserId();

  if (!targetId || targetId === followerId) {
    throw new Error("El usuario indicado no es válido.");
  }

  const followId = `${followerId}_${targetId}`;

  const followRef = doc(
    db,
    FOLLOWS_COLLECTION,
    followId
  );

  const existingDoc = await getDoc(followRef);

  if (!existingDoc.exists()) {
    return;
  }

  await deleteDoc(followRef);
}
