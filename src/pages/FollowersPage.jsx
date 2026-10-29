import { useEffect, useState } from 'react';
import UserCard from '../components/common/UserCard';
import { getFollowers } from '../services/followService';
import { useAuth } from '../hooks/useAuth';

function FollowersPage() {
  const { user } = useAuth();
  const currentUserId = user?.uid;

  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    if (!currentUserId) {
      setFollowers([]);
      return;
    }

    const loadFollowers = () => {
      const users = getFollowers(currentUserId);
      setFollowers(users);
    };

    loadFollowers();
  }, [currentUserId]);

  return (
    <section>
      <h2>Usuarios que me siguen</h2>

      <p>Total de seguidores: {followers.length}</p>

      {followers.length === 0 ? (
        <p>Todavía no tienes seguidores.</p>
      ) : (
        followers.map((user) => <UserCard key={user.uid} user={user} />)
      )}
    </section>
  );
}

export default FollowersPage;
