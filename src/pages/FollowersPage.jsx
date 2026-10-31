import { useEffect, useMemo, useState } from 'react';
import useAuth from '../hooks/useAuth';
import usePagination from '../hooks/usePagination';
import UserCard from '../components/common/UserCard';
import ChirpCard from '../components/common/ChirpCard';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import Pagination from '../components/common/Pagination';
import { getFollowerUsers, getFollowingIds } from '../services/followService';
import { getTweetsByUsers } from '../services/tweetService';

// Followers page with Firestore data, search filter, alphabetical sort, and pagination
export default function FollowersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showListTweets, setShowListTweets] = useState(false);
  const [listTweets, setListTweets] = useState([]);
  const [tweetsLoading, setTweetsLoading] = useState(false);

  const userId = user?.id || user?.uid;

  const loadData = async () => {
    if (!userId) return;
    setLoading(true);
    setError('');

    try {
      const [followers, following] = await Promise.all([
        getFollowerUsers(userId),
        getFollowingIds(userId),
      ]);
      setUsers(followers || []);
      setFollowingIds(following || []);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los seguidores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const toggleListTweets = async () => {
    if (showListTweets) {
      setShowListTweets(false);
      return;
    }

    setTweetsLoading(true);
    try {
      const tweets = await getTweetsByUsers(users.map((item) => item.id || item.uid));
      setListTweets(tweets || []);
      setShowListTweets(true);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar las publicaciones.');
    } finally {
      setTweetsLoading(false);
    }
  };

  // Filter by search query
  const filteredUsers = useMemo(() => {
    return users.filter((item) =>
      `${item.name || item.fullName || ''} ${item.username || ''}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [users, search]);

  // Sort followers alphabetically (Milestone 1 requirement)
  const sortedFollowers = useMemo(() => {
    return [...filteredUsers].sort((a, b) =>
      (a.name || a.fullName || a.username || '').localeCompare(
        b.name || b.fullName || b.username || '',
        'es',
        { sensitivity: 'base' }
      )
    );
  }, [filteredUsers]);

  // Pagination of max 10 users (Milestone 1 requirement)
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
      <header className="page-header" style={{ padding: '12px 16px' }}>
        <h1 style={{ margin: 0, fontSize: '20px' }}>Seguidores</h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
          Total de seguidores: {users.length}
        </p>
      </header>

      <div className="list-tweets-action" style={{ padding: '12px 16px' }}>
        <button
          type="button"
          className="button button--outline"
          onClick={toggleListTweets}
          disabled={tweetsLoading || loading || users.length === 0}
        >
          {tweetsLoading
            ? 'Cargando publicaciones...'
            : showListTweets
            ? 'Ocultar publicaciones'
            : 'Ver publicaciones de tus seguidores'}
        </button>
      </div>

      {showListTweets && (
        <div style={{ borderBottom: '1px solid var(--line)' }}>
          {listTweets.length ? (
            listTweets.map((chirp) => <ChirpCard key={chirp.id} chirp={chirp} />)
          ) : (
            <EmptyState
              title="Sin publicaciones"
              description="Las personas de esta lista todavía no tienen publicaciones."
            />
          )}
        </div>
      )}

      <div className="search-box" style={{ padding: '12px 16px' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar entre tus seguidores"
        />
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="form-error" role="alert" style={{ padding: '16px' }}>
          {error}
        </p>
      ) : paginatedItems.length ? (
        <>
          <div>
            {paginatedItems.map((follower) => (
              <UserCard
                key={follower.id || follower.uid}
                user={follower}
                currentUser={user}
                followingIds={followingIds}
                onFollowChange={loadData}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            nextPage={nextPage}
            previousPage={previousPage}
            goToPage={goToPage}
          />
        </>
      ) : (
        <EmptyState
          title="Todavía no tienes seguidores"
          description="Cuando otras personas te sigan, aparecerán aquí."
        />
      )}
    </section>
  );
}
