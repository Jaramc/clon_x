
import { mockFollows } from '../mocks/mockFollows';
import { mockUsers } from '../mocks/mockUsers';

// Copia de trabajo de las relaciones simuladas.
let follows = mockFollows.map((follow) => ({ ...follow }));

// Verificar si un usuario sigue a otro.
export function isFollowing(followerId, followingId) {
  return follows.some(
    (follow) =>
      follow.followerId === followerId &&
      follow.followingId === followingId
  );
}

// Seguir a un usuario.
export function followUser(followerId, followingId) {
  if (!followerId || !followingId) {
    throw new Error('Los identificadores son obligatorios');
  }

  if (followerId === followingId) {
    throw new Error('No puedes seguirte a ti mismo');
  }

  const usersExist = [followerId, followingId].every((id) =>
    mockUsers.some((user) => user.uid === id)
  );

  if (!usersExist) {
    throw new Error('Uno de los usuarios no existe');
  }

  if (isFollowing(followerId, followingId)) {
    return false;
  }

  follows = [...follows, { followerId, followingId }];
  return true;
}

// Dejar de seguir a un usuario.
export function unfollowUser(followerId, followingId) {
  if (!isFollowing(followerId, followingId)) {
    return false;
  }

  follows = follows.filter(
    (follow) =>
      !(
        follow.followerId === followerId &&
        follow.followingId === followingId
      )
  );

  return true;
}

// Obtener los usuarios que sigue una persona.
export function getFollowing(userId) {
  const ids = new Set(
    follows
      .filter((follow) => follow.followerId === userId)
      .map((follow) => follow.followingId)
  );

  return mockUsers.filter((user) => ids.has(user.uid));
}

// Obtener los seguidores de una persona.
export function getFollowers(userId) {
  const ids = new Set(
    follows
      .filter((follow) => follow.followingId === userId)
      .map((follow) => follow.followerId)
  );

  return mockUsers.filter((user) => ids.has(user.uid));
}

// Obtener cantidades de seguidores y seguidos.
export function getFollowCounts(userId) {
  return {
    followersCount: getFollowers(userId).length,
    followingCount: getFollowing(userId).length,
  };
}
