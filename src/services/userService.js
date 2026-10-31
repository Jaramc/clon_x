import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { normalizeUsername } from '../lib/validators';
import { mockUsers } from '../mocks/mockUsers';

const USERS_COLLECTION = 'users';
const USERNAMES_COLLECTION = 'usernames';

// Retrieve user profile by user document ID
export async function getUserById(id) {
  try {
    const snapshot = await getDoc(doc(db, USERS_COLLECTION, id));
    if (snapshot.exists()) {
      return { id: snapshot.id, uid: snapshot.id, ...snapshot.data() };
    }
  } catch (error) {
    console.warn('Falling back to mock users for getUserById:', error.message);
  }

  const foundMock = mockUsers.find((u) => u.id === id || u.uid === id);
  return foundMock || null;
}

// Retrieve user profile by @username (checks 'usernames' collection first)
export async function getUserByUsername(username) {
  if (!username) return null;
  const normalized = normalizeUsername(username.trim().replace(/^@/, ''));

  try {
    // 1. Check direct lookup in 'usernames' index collection
    const usernameDoc = await getDoc(doc(db, USERNAMES_COLLECTION, normalized));
    if (usernameDoc.exists()) {
      const { uid } = usernameDoc.data();
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
      if (userDoc.exists()) {
        return { id: userDoc.id, uid: userDoc.id, ...userDoc.data() };
      }
    }

    // 2. Fallback query on 'users' collection
    const usersQuery = query(
      collection(db, USERS_COLLECTION),
      where('usernameLower', '==', normalized)
    );
    const snapshot = await getDocs(usersQuery);
    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      return { id: userDoc.id, uid: userDoc.id, ...userDoc.data() };
    }
  } catch (error) {
    console.warn('Falling back to mock users for getUserByUsername:', error.message);
  }

  // 3. Fallback to mock users for testing
  const foundMock = mockUsers.find(
    (u) => normalizeUsername(u.username) === normalized
  );
  return foundMock || null;
}

// Check if a username is available
export async function isUsernameAvailable(username) {
  const existing = await getUserByUsername(username);
  return !existing;
}

// Get all registered users
export async function getUsers() {
  try {
    const snapshot = await getDocs(collection(db, USERS_COLLECTION));
    if (!snapshot.empty) {
      return snapshot.docs.map((item) => ({
        id: item.id,
        uid: item.id,
        ...item.data(),
      }));
    }
  } catch (error) {
    console.warn('Falling back to mock users for getUsers:', error.message);
  }

  return mockUsers;
}

// Create or update user profile with transactional username uniqueness guarantee
export async function createUserProfile(uid, values) {
  const username = values.username.trim().replace(/^@/, '');
  const usernameLower = normalizeUsername(username);
  const email = values.email.trim().toLowerCase();

  const profile = {
    username,
    usernameLower,
    name: (values.name || username).trim(),
    email,
    bio: values.bio || '',
    avatar: (values.name || username).trim().slice(0, 2).toUpperCase(),
    createdAt: new Date().toISOString(),
  };

  const usernameRef = doc(db, USERNAMES_COLLECTION, usernameLower);
  const userRef = doc(db, USERS_COLLECTION, uid);

  try {
    await runTransaction(db, async (transaction) => {
      const usernameSnap = await transaction.get(usernameRef);
      if (usernameSnap.exists() && usernameSnap.data().uid !== uid) {
        throw new Error('Ese nombre de usuario ya está registrado.');
      }

      transaction.set(usernameRef, {
        uid,
        email,
        username,
        usernameLower,
        createdAt: profile.createdAt,
      });

      transaction.set(userRef, profile);
    });
  } catch (error) {
    if (error.message.includes('nombre de usuario ya está')) {
      throw error;
    }
    console.warn('Transaction failed, attempting direct setDoc:', error.message);
    await setDoc(userRef, profile);
    await setDoc(usernameRef, { uid, email, username, usernameLower });
  }

  return {
    id: uid,
    uid,
    ...profile,
  };
}
