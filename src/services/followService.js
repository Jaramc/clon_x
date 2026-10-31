import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { getUserByUsername, getUsers } from './userService';
import { mockFollows } from '../mocks/mockFollows';
import { mockUsers } from '../mocks/mockUsers';

const FOLLOWS_COLLECTION = 'follows';

// In-memory fallback follows array
let localFollows = mockFollows.map((f) => ({ ...f }));

function getAuthenticatedUserId() {
  return auth.currentUser?.uid;
}

async function getFollowDocuments(field, userId) {
  try {
    const followsQuery = query(
      collection(db, FOLLOWS_COLLECTION),
      where(field, '==', userId)
    );
    const snapshot = await getDocs(followsQuery);
    return snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));
  } catch (error) {
    console.warn('Falling back to local follows for field', field, error.message);
    return localFollows.filter((f) => f[field] === userId);
  }
}

// Get IDs of users that a person is following
export async function getFollowingIds(userId) {
  const currentId = userId || getAuthenticatedUserId();
  if (!currentId) return [];

  const follows = await getFollowDocuments('followerId', currentId);
  return [...new Set(follows.map((item) => item.followingId).filter(Boolean))];
}

// Get IDs of users that are following a person
export async function getFollowerIds(userId) {
  const currentId = userId || getAuthenticatedUserId();
  if (!currentId) return [];

  const follows = await getFollowDocuments('followingId', currentId);
  return [...new Set(follows.map((item) => item.followerId).filter(Boolean))];
}

// Get full profile objects of users that a person is following
export async function getFollowingUsers(userId) {
  const ids = await getFollowingIds(userId);
  try {
    const users = await getUsers();
    const result = users.filter((u) => ids.includes(u.id || u.uid));
    return result.length > 0 ? result : mockUsers.filter((u) => ids.includes(u.uid || u.id));
  } catch (error) {
    return mockUsers.filter((u) => ids.includes(u.uid || u.id));
  }
}

// Alias for getFollowingUsers to support legacy/mock calls
export function getFollowing(userId) {
  return getFollowingUsers(userId);
}

// Get full profile objects of users that follow a person
export async function getFollowerUsers(userId) {
  const ids = await getFollowerIds(userId);
  try {
    const users = await getUsers();
    const result = users.filter((u) => ids.includes(u.id || u.uid));
    return result.length > 0 ? result : mockUsers.filter((u) => ids.includes(u.uid || u.id));
  } catch (error) {
    return mockUsers.filter((u) => ids.includes(u.uid || u.id));
  }
}

// Alias for getFollowerUsers to support legacy/mock calls
export function getFollowers(userId) {
  return getFollowerUsers(userId);
}

// Get follower and following counts
export async function getFollowCounts(userId) {
  const [followers, following] = await Promise.all([
    getFollowerIds(userId),
    getFollowingIds(userId),
  ]);
  return {
    followersCount: followers.length,
    followingCount: following.length,
  };
}

// Follow a user by their @username
export async function followByUsername(currentUser, username) {
  const followerId = currentUser?.id || currentUser?.uid || getAuthenticatedUserId();

  if (!followerId) {
    throw new Error('Debes iniciar sesión para seguir usuarios.');
  }

  const target = await getUserByUsername(username);
  if (!target) {
    throw new Error('No encontramos un usuario con ese nombre.');
  }

  const targetId = target.id || target.uid;
  if (targetId === followerId) {
    throw new Error('No puedes seguirte a ti mismo.');
  }

  const followId = `${followerId}_${targetId}`;

  try {
    const followRef = doc(db, FOLLOWS_COLLECTION, followId);
    const existingDoc = await getDoc(followRef);

    if (existingDoc.exists()) {
      throw new Error('Ya sigues a este usuario.');
    }

    await setDoc(followRef, {
      followerId,
      followingId: targetId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error.message === 'Ya sigues a este usuario.') throw error;
    console.warn('Falling back to local in-memory follow:', error.message);
    const exists = localFollows.some((f) => f.followerId === followerId && f.followingId === targetId);
    if (exists) throw new Error('Ya sigues a este usuario.');
    localFollows.push({ followerId, followingId: targetId });
  }

  return target;
}

// Check if a user is following another user
export async function isFollowing(followerId, followingId) {
  if (!followerId || !followingId) return false;
  try {
    const followRef = doc(db, FOLLOWS_COLLECTION, `${followerId}_${followingId}`);
    const snapshot = await getDoc(followRef);
    return snapshot.exists();
  } catch (error) {
    return localFollows.some((f) => f.followerId === followerId && f.followingId === followingId);
  }
}

// Unfollow a user
export async function unfollowUser(currentUserOrFollowerId, targetIdOrFollowingId) {
  const followerId =
    typeof currentUserOrFollowerId === 'object'
      ? currentUserOrFollowerId?.id || currentUserOrFollowerId?.uid
      : currentUserOrFollowerId || getAuthenticatedUserId();

  const targetId = targetIdOrFollowingId;

  if (!targetId || targetId === followerId) {
    throw new Error('El usuario indicado no es válido.');
  }

  const followId = `${followerId}_${targetId}`;

  try {
    const followRef = doc(db, FOLLOWS_COLLECTION, followId);
    await deleteDoc(followRef);
  } catch (error) {
    console.warn('Falling back to local unfollow:', error.message);
  }

  localFollows = localFollows.filter(
    (f) => !(f.followerId === followerId && f.followingId === targetId)
  );

  return true;
}

// Follow a user by their user ID
export async function followUser(followerId, followingId) {
  if (!followerId || !followingId) {
    throw new Error('Los identificadores son obligatorios');
  }
  if (followerId === followingId) {
    throw new Error('No puedes seguirte a ti mismo');
  }

  const followId = `${followerId}_${followingId}`;
  try {
    const followRef = doc(db, FOLLOWS_COLLECTION, followId);
    await setDoc(followRef, {
      followerId,
      followingId,
      createdAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    localFollows.push({ followerId, followingId });
    return true;
  }
}
