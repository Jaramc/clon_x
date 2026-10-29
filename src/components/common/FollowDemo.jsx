
import { useState } from 'react';
import UserCard from './UserCard';
import FollowButton from './FollowButton';

import { mockUsers } from '../../mocks/mockUsers';

import {
  isFollowing,
  followUser,
  unfollowUser,
  getFollowCounts,
} from '../../services/followService';

// Usuario que está utilizando la aplicación.
const currentUserId = 'user-101';

function FollowDemo() {
  const [users, setUsers] = useState(() =>
    mockUsers.map((user) => ({
      ...user,
      isFollowing: isFollowing(currentUserId, user.uid),
    }))
  );

  const [counts, setCounts] = useState(() =>
    getFollowCounts(currentUserId)
  );

  const handleToggle = async (uid) => {
    if (uid === currentUserId) {
      throw new Error('No puedes seguirte a ti mismo');
    }

    if (isFollowing(currentUserId, uid)) {
      unfollowUser(currentUserId, uid);
    } else {
      followUser(currentUserId, uid);
    }

    setUsers((previousUsers) =>
      previousUsers.map((user) => ({
        ...user,
        isFollowing: isFollowing(currentUserId, user.uid),
      }))
    );

    setCounts(getFollowCounts(currentUserId));
  };

  return (
    <section>
      <h2>Sistema de seguidores y seguidos</h2>

      <p>Seguidores: {counts.followersCount}</p>
      <p>Seguidos: {counts.followingCount}</p>

      <h3>Usuarios disponibles</h3>

      {users.map((user) => (
        <UserCard key={user.uid} user={user}>
          <FollowButton
            isFollowing={user.isFollowing}
            disabled={user.uid === currentUserId}
            onToggle={() => handleToggle(user.uid)}
          />
        </UserCard>
      ))}
    </section>
  );
}

export default FollowDemo;