import { useCallback, useEffect, useMemo, useState } from 'react';
import useAuth from '../hooks/useAuth';
import usePagination from '../hooks/usePagination';
import UserCard from '../components/common/UserCard';
import ChirpCard from '../components/common/ChirpCard';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import Pagination from '../components/common/Pagination';
import { followByUsername, getFollowingUsers } from '../services/followService';
import { getTweetsByUsers } from '../services/tweetService';

// Following page with follow-by-username action, real Firestore data, alphabetical sort, and pagination
export default function FollowingPage() {
  const { user } = useAuth();

  const [followingIds, setFollowingIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [target, setTarget] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [showListTweets, setShowListTweets] = useState(false);
  const [listTweets, setListTweets] = useState([]);
  const [tweetsLoading, setTweetsLoading] = useState(false);

  const userId = user?.id || user?.uid;

  const loadData = useCallback(async () => {
    if (!userId) {
      setUsers([]);
      setFollowingIds([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const followedUsers = await getFollowingUsers(userId);
      const ids = (followedUsers || []).map((item) => item.id || item.uid);

      setFollowingIds(ids);
      setUsers(followedUsers || []);
    } catch (err) {
      console.error('Error cargando seguidos:', err);
      setMessage(err?.message || 'No se pudo cargar la lista de seguidos.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFollowSubmit = async (event) => {
    event.preventDefault();
    if (!target.trim()) return;

    setMessage('');
    setBusy(true);

    try {
      const followed = await followByUsername(user, target.trim());
      setTarget('');
      setMessage(`Ahora sigues a @${followed.username}.`);
      await loadData();
    } catch (err) {
      console.error('Error siguiendo usuario:', err);
      setMessage(err?.message || 'No se pudo seguir a ese usuario.');
    } finally {
      setBusy(false);
    }
  };

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
      console.error('Error cargando publicaciones:', err);
      setMessage(err?.message || 'No se pudieron cargar las publicaciones.');
    } finally {
      setTweetsLoading(false);
    }
  };

  // Filter users by search term
  const filteredUsers = useMemo(() => {
    return users.filter((item) =>
      `${item.name || item.fullName || ''} ${item.username || ''}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [users, search]);

  // Sort followed users alphabetically (Milestone 1 requirement)
  const sortedFollowing = useMemo(() => {
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
  } = usePagination(sortedFollowing, 10);

  return (
    <section>
      <header className="page-header" style={{ padding: '12px 16px' }}>
        <h1 style={{ margin: 0, fontSize: '20px' }}>Seguidos</h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
          Total de seguidos: {users.length}
        </p>
      </header>

      <form className="follow-search" onSubmit={handleFollowSubmit} style={{ padding: '16px', borderBottom: '1px solid var(--line)' }}>
        <label htmlFor="follow-username" style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
          Seguir por nombre de usuario
        </label>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            id="follow-username"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            placeholder="@nombredeusuario"
            required
            style={{ flex: 1 }}
          />

          <button className="button" disabled={busy || !user} type="submit">
            {busy ? 'Buscando...' : 'Seguir'}
          </button>
        </div>

        {message && (
          <p
            className={message.startsWith('Ahora') ? 'success-message' : 'form-error'}
            role="status"
            style={{ marginTop: '8px' }}
          >
            {message}
          </p>
        )}
      </form>

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
            : 'Ver publicaciones de tus seguidos'}
        </button>
      </div>

      {showListTweets && (
        <div style={{ borderBottom: '1px solid var(--line)' }}>
          {listTweets.length > 0 ? (
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
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar entre los usuarios que sigues"
        />
      </div>

      {loading ? (
        <Spinner />
      ) : paginatedItems.length > 0 ? (
        <>
          <div>
            {paginatedItems.map((item) => (
              <UserCard
                key={item.id || item.uid}
                user={item}
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
          title="Aún no sigues a nadie"
          description="Busca un nombre de usuario arriba para comenzar."
        />
      )}
    </section>
  );
}
