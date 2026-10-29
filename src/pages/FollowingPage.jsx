
import { useEffect, useMemo, useState } from 'react';
import UserCard from '../components/common/UserCard';
import Pagination from '../components/common/Pagination';
import { getFollowing } from '../services/followService';
import { useAuth } from '../hooks/useAuth';
import usePagination from '../hooks/usePagination';

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

  // Ordenar alfabéticamente por nombre completo
  const sortedFollowing = useMemo(() => {
    return [...following].sort((a, b) =>
      (a.fullName || a.username || '').localeCompare(
        b.fullName || b.username || '',
        'es',
        { sensitivity: 'base' }
      )
    );
  }, [following]);

  // Aplicar paginación: máximo 10 usuarios
  const {
    currentPage,
    totalPages,
    paginatedItems,
    nextPage,
    previousPage,
    goToPage,
  } = usePagination(sortedFollowing, 10);

  return (
    <section>
      <h2>Usuarios que sigo</h2>

      <p>Total de seguidos: {following.length}</p>

      {following.length === 0 ? (
        <p>Todavía no sigues a ningún usuario.</p>
      ) : (
        <>
          {paginatedItems.map((followedUser) => (
            <UserCard
              key={followedUser.uid}
              user={followedUser}
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

export default FollowingPage;
