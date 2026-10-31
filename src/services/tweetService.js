import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { MAX_TWEET_LENGTH } from "../lib/validators";

const CHIRPS_COLLECTION = "chirps_v2";

function mapChirp(snapshot) {
  return { id: snapshot.id, ...snapshot.data() };
}

export async function getTweets() {
  const snapshot = await getDocs(collection(db, CHIRPS_COLLECTION));
  return snapshot.docs
    .map(mapChirp)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getTweetsByUser(userId) {
  const chirpsQuery = query(
    collection(db, CHIRPS_COLLECTION),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(chirpsQuery);
  return snapshot.docs
    .map(mapChirp)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createTweet(user, text) {
  const trimmed = (text || "").trim();

  if (!user?.id) throw new Error("Debes iniciar sesión para publicar.");
  if (!trimmed) throw new Error("Escribe algo antes de publicar.");
  if (trimmed.length > MAX_TWEET_LENGTH) {
    throw new Error("La publicación no puede superar los 280 caracteres.");
  }

  const chirp = {
    userId: user.id,
    username: user.username || "",
    name: user.name || user.username || "Usuario",
    text: trimmed,
    createdAt: new Date().toISOString(),
  };

  const reference = await addDoc(collection(db, CHIRPS_COLLECTION), chirp);
  return { id: reference.id, ...chirp };
}

export async function getTweetsByUsers(userIds) {
  const uniqueIds = [...new Set((userIds || []).filter(Boolean))];
  if (!uniqueIds.length) return [];

  const results = await Promise.all(uniqueIds.map((userId) => getTweetsByUser(userId)));
  return results
    .flat()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
