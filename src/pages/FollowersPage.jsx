import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import usePagination from '../hooks/usePagination';
import useToast from '../hooks/useToast';
import UserCard from '../components/common/UserCard';
import ChirpCard from '../components/common/ChirpCard';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import Pagination from '../components/common/Pagination';
import Toast from '../components/common/Toast';
import { getUserByUsername } from '../services/userService';
import { getFollowerUsers, getFollowingIds } from '../services/followService';
import { getTweetsByUsers } from '../services/tweetService';

// Followers page supporting both authenticated user (/followers) and third-party profiles (/users/:username/followers)
export default function FollowersPage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const { toast, showToast, clearToast } = useToast();

  const [targetUser, setTargetUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [myFollowingIds, setMyFollowingIds] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showListTweets, setShowListTweets] = useState(false);
  const [listTweets, setListTweets] = useState([]);
  const [tweetsLoading, setTweetsLoading] = useState(false);

  const currentUserId = currentUser?.id || currentUser?.uid;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      let resolvedTarget = null;
      let targetId = null;

      if (username) {
        resolvedTarget = await getUserByUsername(username);
        if (!resolvedTarget) {
          setError(`No encontramos al usuario @${username}`);
          setLoading(false);
          return;
        }
        targetId = resolvedTarget.id || resolvedTarget.uid;
        setTargetUser(resolvedTarget);
      } else {
        if (!currentUserId) {
          setLoading(false);
          return;
        }
        targetId = currentUserId;
        setTargetUser(currentUser);
      }

      const [followers, myFollowing] = await Promise.all([
        getFollowerUsers(targetId),
        currentUserId ? getFollowingIds(currentUserId) : Promise.resolve([]),
      ]);

      setUsers(followers || []);
      setMyFollowingIds(myFollowing || []);
    } catch (err) {
      console.error('Error al cargar seguidores:', err);
      setError(err?.message || 'No se pudieron cargar los seguidores.');
    } finally {
      setLoading(false);
    }
  }, [username, currentUserId, currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh current user's follow state after button toggle
  const handleFollowChange = async () => {
    if (!currentUserId) return;
    try {
      const updated = await getFollowingIds(currentUserId);
      setMyFollowingIds(updated || []);
      showToast('Relación de seguimiento actualizada con éxito', 'success');
    } catch (err) {
      console.warn('Error refrescando seguidos:', err);
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
      showToast(err?.message || 'No se pudieron cargar las publicaciones.', 'error');
    } finally {
      setTweetsLoading(false);
    }
  };

  // Filter followers by search term
  const filteredUsers = useMemo(() => {
    return users.filter((item) =>
      `${item.fullName || item.name || ''} ${item.username || ''}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [users, search]);

  // Sort followers alphabetically by full name (Milestone 1 & 3 requirement)
  const sortedFollowers = useMemo(() => {
    return [...filteredUsers].sort((a, b) =>
      (a.fullName || a.name || a.username || '').localeCompare(
        b.fullName || b.name || b.username || '',
        'es',
        { sensitivity: 'base' }
      )
    );
  }, [filteredUsers]);

  // Pagination with strict limit of 10 items per page
  const {
    currentPage,
    totalPages,
    paginatedItems,
    nextPage,
    previousPage,
    goToPage,
  } = usePagination(sortedFollowers, 10);

  const isThirdParty = Boolean(username && targetUser && (targetUser.id || targetUser.uid) !== currentUserId);

  return (
    <section>
      <header
        className="page-header"
        style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px' }}
      >
        {isThirdParty && (
          <Link
            to={`/users/${encodeURIComponent(username)}`}
            style={{ color: 'var(--text)', fontSize: '20px', textDecoration: 'none' }}
            aria-label="Volver al perfil"
          >
            ←
          </Link>
        )}
        <div>
          <h1 style={{ margin: 0, fontSize: '20px' }}>
            {isThirdParty
              ? `Seguidores de @${targetUser.username}`
              : 'Seguidores'}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
            {users.length} {users.length === 1 ? 'seguidor' : 'seguidores'}
          </p>
        </div>
      </header>

      {/* Button to view tweets from users in this list */}
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
            : isThirdParty
            ? `Ver publicaciones de los seguidores de @${username}`
            : 'Ver publicaciones de tus seguidores'}
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

      {/* Search box to filter users */}
      <div className="search-box" style={{ padding: '12px 16px' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isThirdParty ? `Buscar entre los seguidores de @${username}` : 'Buscar entre tus seguidores'}
        />
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="form-error" role="alert" style={{ padding: '16px' }}>
          {error}
        </p>
      ) : paginatedItems.length > 0 ? (
        <>
          <div>
            {paginatedItems.map((follower) => (
              <UserCard
                key={follower.id || follower.uid}
                user={follower}
                currentUser={currentUser}
                followingIds={myFollowingIds}
                onFollowChange={handleFollowChange}
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
          title={isThirdParty ? `@${username} no tiene seguidores` : 'Todavía no tienes seguidores'}
          description={
            isThirdParty
              ? 'Cuando otros usuarios sigan a esta cuenta, aparecerán listados aquí.'
              : 'Cuando otras personas te sigan, aparecerán aquí.'
          }
        />
      )}

      <Toast toast={toast} onClose={clearToast} />
    </section>
  );
}

