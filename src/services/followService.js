import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
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
  if (!ids || ids.length === 0) return [];

  try {
    const allUsers = await getUsers();
    const userMap = new Map();
    (allUsers || []).forEach((u) => userMap.set(u.id || u.uid, u));
    mockUsers.forEach((u) => {
      const uid = u.id || u.uid;
      if (!userMap.has(uid)) userMap.set(uid, u);
    });

    const result = [];
    for (const id of ids) {
      if (userMap.has(id)) {
        result.push(userMap.get(id));
      } else {
        const fetched = await getUserById(id);
        if (fetched) {
          userMap.set(id, fetched);
          result.push(fetched);
        }
      }
    }
    return result;
  } catch (error) {
    console.warn('Falling back to mock users for following list:', error.message);
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
  if (!ids || ids.length === 0) return [];

  try {
    const allUsers = await getUsers();
    const userMap = new Map();
    (allUsers || []).forEach((u) => userMap.set(u.id || u.uid, u));
    mockUsers.forEach((u) => {
      const uid = u.id || u.uid;
      if (!userMap.has(uid)) userMap.set(uid, u);
    });

    const result = [];
    for (const id of ids) {
      if (userMap.has(id)) {
        result.push(userMap.get(id));
      } else {
        const fetched = await getUserById(id);
        if (fetched) {
          userMap.set(id, fetched);
          result.push(fetched);
        }
      }
    }
    return result;
  } catch (error) {
    console.warn('Falling back to mock users for followers list:', error.message);
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

// Real-time listener for follow counts
export function subscribeToFollowCounts(userId, callback) {
  if (!userId || typeof callback !== 'function') return () => {};

  let followingCount = 0;
  let followersCount = 0;

  let unsubFollowing = () => {};
  let unsubFollowers = () => {};

  try {
    const followingQuery = query(
      collection(db, FOLLOWS_COLLECTION),
      where('followerId', '==', userId)
    );
    unsubFollowing = onSnapshot(
      followingQuery,
      (snapshot) => {
        followingCount = snapshot.size;
        callback({ followingCount, followersCount });
      },
      (error) => {
        console.warn('Real-time following count error:', error.message);
      }
    );

    const followersQuery = query(
      collection(db, FOLLOWS_COLLECTION),
      where('followingId', '==', userId)
    );
    unsubFollowers = onSnapshot(
      followersQuery,
      (snapshot) => {
        followersCount = snapshot.size;
        callback({ followingCount, followersCount });
      },
      (error) => {
        console.warn('Real-time followers count error:', error.message);
      }
    );
  } catch (err) {
    console.warn('Error setting up follow count listeners:', err.message);
  }

  return () => {
    unsubFollowing();
    unsubFollowers();
  };
}

// Check if a user is following another user
export async function isFollowing(followerId, followingId) {
  const fId = typeof followerId === 'object' ? followerId?.id || followerId?.uid : followerId;
  const tId = typeof followingId === 'object' ? followingId?.id || followingId?.uid : followingId;

  if (!fId || !tId) return false;
  try {
    const followRef = doc(db, FOLLOWS_COLLECTION, `${fId}_${tId}`);
    const snapshot = await getDoc(followRef);
    return snapshot.exists();
  } catch (error) {
    return localFollows.some((f) => f.followerId === fId && f.followingId === tId);
  }
}

// Real-time listener for single relationship status
export function subscribeToFollowStatus(followerId, followingId, callback) {
  const fId = typeof followerId === 'object' ? followerId?.id || followerId?.uid : followerId;
  const tId = typeof followingId === 'object' ? followingId?.id || followingId?.uid : followingId;

  if (!fId || !tId || typeof callback !== 'function') return () => {};

  try {
    const followRef = doc(db, FOLLOWS_COLLECTION, `${fId}_${tId}`);
    return onSnapshot(
      followRef,
      (snapshot) => {
        callback(snapshot.exists());
      },
      (error) => {
        console.warn('Real-time follow status error:', error.message);
      }
    );
  } catch (err) {
    console.warn('Error setting up follow status listener:', err.message);
    return () => {};
  }
}

// Follow a user by their user ID or user object
export async function followUser(currentUserOrFollowerId, targetUserOrFollowingId) {
  const followerId =
    typeof currentUserOrFollowerId === 'object'
      ? currentUserOrFollowerId?.id || currentUserOrFollowerId?.uid
      : currentUserOrFollowerId || getAuthenticatedUserId();

  const targetId =
    typeof targetUserOrFollowingId === 'object'
      ? targetUserOrFollowingId?.id || targetUserOrFollowingId?.uid
      : targetUserOrFollowingId;

  if (!followerId || !targetId) {
    throw new Error('Debes iniciar sesión para seguir usuarios.');
  }
  if (followerId === targetId) {
    throw new Error('No puedes seguirte a ti mismo.');
  }

  const followId = `${followerId}_${targetId}`;
  try {
    const followRef = doc(db, FOLLOWS_COLLECTION, followId);
    await setDoc(followRef, {
      followerId,
      followingId: targetId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Falling back to local follow:', error.message);
  }

  const exists = localFollows.some(
    (f) => f.followerId === followerId && f.followingId === targetId
  );
  if (!exists) {
    localFollows.push({
      followerId,
      followingId: targetId,
      createdAt: new Date().toISOString(),
    });
  }

  return true;
}

// Unfollow a user
export async function unfollowUser(currentUserOrFollowerId, targetUserOrFollowingId) {
  const followerId =
    typeof currentUserOrFollowerId === 'object'
      ? currentUserOrFollowerId?.id || currentUserOrFollowerId?.uid
      : currentUserOrFollowerId || getAuthenticatedUserId();

  const targetId =
    typeof targetUserOrFollowingId === 'object'
      ? targetUserOrFollowingId?.id || targetUserOrFollowingId?.uid
      : targetUserOrFollowingId;

  if (!followerId || !targetId || targetId === followerId) {
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

  const alreadyFollowing = await isFollowing(followerId, targetId);
  if (alreadyFollowing) {
    throw new Error('Ya sigues a este usuario.');
  }

  await followUser(followerId, targetId);
  return target;
}
