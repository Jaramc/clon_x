import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MAX_TWEET_LENGTH } from '../lib/validators';
import { mockTweets } from '../mocks/mockTweets';

export const TWEETS_COLLECTION = 'tweets';

function mapTweet(snapshot) {
  return { id: snapshot.id, ...snapshot.data() };
}

// In-memory fallback tweets copied from mocks
let localTweets = [...mockTweets];

// Get all tweets (supports both mock and Firestore)
export async function getTweets() {
  try {
    const snapshot = await getDocs(collection(db, TWEETS_COLLECTION));
    if (snapshot.empty && localTweets.length > 0) {
      return localTweets;
    }
    return snapshot.docs
      .map(mapTweet)
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
  if (!userId) return [];
  try {
    const tweetsQuery = query(collection(db, TWEETS_COLLECTION), where('userId', '==', userId));
    const snapshot = await getDocs(tweetsQuery);
    if (!snapshot.empty) {
      return snapshot.docs
        .map(mapTweet)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  } catch (error) {
    console.warn('Falling back to local user tweets:', error.message);
  }

  // Fallback to local memory tweets
  return localTweets
    .filter((tweet) => tweet.userId === userId || tweet.authorUsername === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Create and save a new tweet with optional image
export async function createTweet(user, text, imageUrl = null) {
  const author = typeof user === 'object' ? user : { username: 'usuario_demo', name: 'Mi Usuario' };
  const content = typeof user === 'string' ? user : text;
  const trimmed = (content || '').trim();

  if (!trimmed && !imageUrl)
    throw new Error('Escribe algo o adjunta una imagen antes de publicar.');
  if (trimmed.length > (MAX_TWEET_LENGTH || 280)) {
    throw new Error('La publicación no puede superar los 280 caracteres.');
  }

  const tweet = {
    userId: author.id || author.uid || `user-${Date.now()}`,
    username: author.username || 'usuario_demo',
    name: author.name || author.authorName || author.username || 'Usuario',
    text: trimmed,
    content: trimmed,
    imageUrl: imageUrl || null,
    likes: 0,
    createdAt: new Date().toISOString(),
  };

  try {
    const reference = await addDoc(collection(db, TWEETS_COLLECTION), tweet);
    const saved = { id: reference.id, ...tweet };
    localTweets = [saved, ...localTweets];
    return saved;
  } catch (error) {
    console.error('Failed to save tweet:', error);
    throw new Error('No se pudo guardar la publicación. Inténtalo de nuevo.');
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
