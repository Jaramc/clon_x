import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MAX_TWEET_LENGTH } from '../lib/validators';
import { mockTweets } from '../mocks/mockTweets';

const CHIRPS_COLLECTION = 'chirps_v2';

function mapChirp(snapshot) {
  return { id: snapshot.id, ...snapshot.data() };
}

// In-memory fallback tweets copied from mocks
let localTweets = [...mockTweets];

// Get all tweets (supports both mock and Firestore)
export async function getTweets() {
  try {
    const snapshot = await getDocs(collection(db, CHIRPS_COLLECTION));
    if (snapshot.empty && localTweets.length > 0) {
      return localTweets;
    }
    return snapshot.docs
      .map(mapChirp)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('Falling back to local mock tweets:', error.message);
    return localTweets;
  }
}

// Alias for getTweets to support legacy/mock calls
export function getFeed() {
  return getTweets();
}

// Get tweets published by a specific user ID
export async function getTweetsByUser(userId) {
  try {
    const chirpsQuery = query(
      collection(db, CHIRPS_COLLECTION),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(chirpsQuery);
    return snapshot.docs
      .map(mapChirp)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('Falling back to local user tweets:', error.message);
    return localTweets.filter(
      (tweet) => tweet.userId === userId || tweet.authorUsername === userId
    );
  }
}

// Create and save a new tweet
export async function createTweet(user, text) {
  const author = typeof user === 'object' ? user : { username: 'usuario_demo', name: 'Mi Usuario' };
  const content = typeof user === 'string' ? user : text;
  const trimmed = (content || '').trim();

  if (!trimmed) throw new Error('Escribe algo antes de publicar.');
  if (trimmed.length > (MAX_TWEET_LENGTH || 280)) {
    throw new Error('La publicación no puede superar los 280 caracteres.');
  }

  const chirp = {
    userId: author.id || author.uid || `user-${Date.now()}`,
    username: author.username || 'usuario_demo',
    name: author.name || author.authorName || author.username || 'Usuario',
    text: trimmed,
    content: trimmed,
    likes: 0,
    createdAt: new Date().toISOString(),
  };

  try {
    const reference = await addDoc(collection(db, CHIRPS_COLLECTION), chirp);
    const saved = { id: reference.id, ...chirp };
    localTweets = [saved, ...localTweets];
    return saved;
  } catch (error) {
    console.warn('Saving tweet locally in memory:', error.message);
    const localSaved = { id: `tweet-${Date.now()}`, ...chirp };
    localTweets = [localSaved, ...localTweets];
    return localSaved;
  }
}

// Get tweets from an array of user IDs
export async function getTweetsByUsers(userIds) {
  const uniqueIds = [...new Set((userIds || []).filter(Boolean))];
  if (!uniqueIds.length) return [];

  const results = await Promise.all(uniqueIds.map((userId) => getTweetsByUser(userId)));
  return results
    .flat()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
