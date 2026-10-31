import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { normalizeUsername } from '../lib/validators';
import { mockUsers } from '../mocks/mockUsers';

const USERS_COLLECTION = 'users';

export async function getUserById(id) {
  try {
    const snapshot = await getDoc(doc(db, USERS_COLLECTION, id));
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
  } catch (error) {
    console.warn('Falling back to mock users for getUserById:', error.message);
  }

  const foundMock = mockUsers.find((u) => u.id === id || u.uid === id);
  return foundMock || null;
}

export async function getUserByUsername(username) {
  const normalized = normalizeUsername(username);

  try {
    const usersQuery = query(
      collection(db, USERS_COLLECTION),
      where('usernameLower', '==', normalized)
    );
    const snapshot = await getDocs(usersQuery);
    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    }
  } catch (error) {
    console.warn('Falling back to mock users for getUserByUsername:', error.message);
  }

  const foundMock = mockUsers.find(
    (u) => normalizeUsername(u.username) === normalized
  );
  return foundMock || null;
}

export async function getUsers() {
  try {
    const snapshot = await getDocs(collection(db, USERS_COLLECTION));
    if (!snapshot.empty) {
      return snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));
    }
  } catch (error) {
    console.warn('Falling back to mock users for getUsers:', error.message);
  }

  return mockUsers;
}

export async function createUserProfile(uid, values) {
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    throw new Error('No tienes permiso para crear este perfil.');
  }

  const username = values.username.trim().replace(/^@/, '');
  const usernameLower = normalizeUsername(username);

  const existingUser = await getUserByUsername(usernameLower);
  if (existingUser && existingUser.id !== uid) {
    throw new Error('Ese nombre de usuario ya está registrado.');
  }

  const profile = {
    username,
    usernameLower,
    name: (values.name || username).trim(),
    email: values.email.trim().toLowerCase(),
    bio: '',
    avatar: (values.name || username)
      .trim()
      .slice(0, 2)
      .toUpperCase(),
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, USERS_COLLECTION, uid), profile);

  return {
    id: uid,
    ...profile,
  };
}
