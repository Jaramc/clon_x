import { mockFollows } from '../mocks/mockFollows';
import { mockUsers } from '../mocks/mockUsers';

// Working copy of simulated follow relationships.
let follows = mockFollows.map((follow) => ({ ...follow }));

// Check if a user is following another user.
export function isFollowing(followerId, followingId) {
  return follows.some(
    (follow) => follow.followerId === followerId && follow.followingId === followingId
  );
}

// Follow a user.
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

// Unfollow a user.
export function unfollowUser(followerId, followingId) {
  if (!isFollowing(followerId, followingId)) {
    return false;
  }

  follows = follows.filter(
    (follow) => !(follow.followerId === followerId && follow.followingId === followingId)
  );

  return true;
}

// Get users that a person is following.
export function getFollowing(userId) {
  const ids = new Set(
    follows.filter((follow) => follow.followerId === userId).map((follow) => follow.followingId)
  );

  return mockUsers.filter((user) => ids.has(user.uid));
}

// Get followers of a person.
export function getFollowers(userId) {
  const ids = new Set(
    follows.filter((follow) => follow.followingId === userId).map((follow) => follow.followerId)
  );

  return mockUsers.filter((user) => ids.has(user.uid));
}

// Get follower and following counts.
export function getFollowCounts(userId) {
  return {
    followersCount: getFollowers(userId).length,
    followingCount: getFollowing(userId).length,
  };
}
