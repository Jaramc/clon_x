import { useEffect, useState } from 'react';
import UserCard from '../components/common/UserCard';
import { getFollowing } from '../services/followService';
import { useAuth } from '../hooks/useAuth';

function FollowingPage() {
  const { user } = useAuth();
  const currentUserId = user?.uid;

  const [following, setFollowing] = useState([]);

  useEffect(() => {
    if (!currentUserId) {
      setFollowing([]);
      return;
    }

    const loadFollowing = () => {
      const users = getFollowing(currentUserId);
      setFollowing(users);
    };

    loadFollowing();
  }, [currentUserId]);

  return (
    <section>
      <h2>Usuarios que sigo</h2>
      <p>Total de seguidos: {following.length}</p>

      {following.length === 0 ? (
        <p>Todavía no sigues a ningún usuario.</p>
      ) : (
        following.map((user) => <UserCard key={user.uid} user={user} />)
      )}
    </section>
  );
}

export default FollowingPage;
