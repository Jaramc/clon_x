
import { useEffect, useMemo, useState } from 'react';
import UserCard from '../components/common/UserCard';
import Pagination from '../components/common/Pagination';
import { getFollowers } from '../services/followService';
import { useAuth } from '../hooks/useAuth';
import usePagination from '../hooks/usePagination';

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

  // Ordenar seguidores alfabéticamente
  const sortedFollowers = useMemo(() => {
    return [...followers].sort((a, b) =>
      (a.fullName || a.username || '').localeCompare(
        b.fullName || b.username || '',
        'es',
        { sensitivity: 'base' }
      )
    );
  }, [followers]);

  // Aplicar paginación de máximo 10 usuarios
  const {
    currentPage,
    totalPages,
    paginatedItems,
    nextPage,
    previousPage,
    goToPage,
  } = usePagination(sortedFollowers, 10);

  return (
    <section>
      <h2>Usuarios que me siguen</h2>

      <p>Total de seguidores: {followers.length}</p>

      {followers.length === 0 ? (
        <p>Todavía no tienes seguidores.</p>
      ) : (
        <>
          {paginatedItems.map((follower) => (
            <UserCard
              key={follower.uid}
              user={follower}
            />
          ))}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            nextPage={nextPage}
            previousPage={previousPage}
            goToPage={goToPage}
          />
        </>
      )}
    </section>
  );
}

export default FollowersPage;
