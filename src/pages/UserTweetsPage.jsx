import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserByUsername } from '../services/userService';
import { getTweetsByUser } from '../services/tweetService';
import { getFollowerIds, getFollowingIds } from '../services/followService';
import useAuth from '../hooks/useAuth';
import usePagination from '../hooks/usePagination';
import ChirpCard from '../components/common/ChirpCard';
import FollowButton from '../components/common/FollowButton';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import Pagination from '../components/common/Pagination';

// Unified page to display any user's profile and tweets with pagination
export default function UserTweetsPage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();

  const [target, setTarget] = useState(null);
  const [chirps, setChirps] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [myFollowingIds, setMyFollowingIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentId = currentUser?.id || currentUser?.uid;

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError('');

      try {
        const profile = await getUserByUsername(username);
        if (!profile) {
          if (active) setTarget(null);
          return;
        }

        const [profileChirps, followers, following, myFollowing] = await Promise.all([
          getTweetsByUser(profile.id),
          getFollowerIds(profile.id).catch(() => []),
          getFollowingIds(profile.id).catch(() => []),
          currentId ? getFollowingIds(currentId).catch(() => []) : Promise.resolve([]),
        ]);

        if (active) {
          setTarget(profile);
          setChirps(profileChirps || []);
          setFollowersCount((followers || []).length);
          setFollowingCount((following || []).length);
          setMyFollowingIds(myFollowing || []);
        }
      } catch (err) {
        if (active) setError(err.message || 'No se pudo cargar el perfil.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, [username, currentId]);

  // Pagination for user tweets (Milestone 1 requirement: max 10)
  const {
    currentPage,
    totalPages,
    paginatedItems,
    nextPage,
    previousPage,
    goToPage,
  } = usePagination(chirps, 10);

  if (loading) return <Spinner />;
  if (error) return <p className="form-error" role="alert" style={{ padding: '16px' }}>{error}</p>;
  if (!target) {
    return (
      <EmptyState
        title="No encontramos ese perfil"
        description="Comprueba el nombre de usuario e inténtalo de nuevo."
      />
    );
  }

  const isMe = currentId && target.id && currentId === target.id;
  const isFollowingTarget = myFollowingIds.includes(target.id);

  const handleFollowChange = async () => {
    const [followers, following, myFollowing] = await Promise.all([
      getFollowerIds(target.id).catch(() => []),
      getFollowingIds(target.id).catch(() => []),
      currentId ? getFollowingIds(currentId).catch(() => []) : Promise.resolve([]),
    ]);
    setFollowersCount((followers || []).length);
    setFollowingCount((following || []).length);
    setMyFollowingIds(myFollowing || []);
  };

  return (
    <section>
      <header className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px' }}>
        <Link to="/feed" style={{ color: 'var(--text)', fontSize: '20px' }}>
          ←
        </Link>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px' }}>{target.name}</h1>
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
            {chirps.length} {chirps.length === 1 ? 'publicación' : 'publicaciones'}
          </span>
        </div>
      </header>

      <div className="profile-banner" />

      <div className="profile-summary">
        <div className="avatar avatar--large">
          {(target.name || target.username || '?').slice(0, 1).toUpperCase()}
        </div>

        <h2>{target.name}</h2>
        <p className="muted">@{target.username}</p>
        {target.bio && <p>{target.bio}</p>}

        <div className="profile-counts">
          <span>
            <strong>{followingCount}</strong> Seguidos
          </span>
          <span>
            <strong>{followersCount}</strong> Seguidores
          </span>
        </div>

        {!isMe && currentUser && (
          <div style={{ marginTop: '12px' }}>
            <FollowButton
              user={target}
              currentUser={currentUser}
              following={isFollowingTarget}
              isFollowing={isFollowingTarget}
              onChange={handleFollowChange}
              onToggle={handleFollowChange}
            />
          </div>
        )}

        {isMe && <p className="muted" style={{ marginTop: '12px' }}>Este es tu perfil.</p>}
      </div>

      <h3 className="section-heading" style={{ marginTop: '16px' }}>Publicaciones</h3>

      {paginatedItems.length ? (
        <>
          <div>
            {paginatedItems.map((chirp) => (
              <ChirpCard key={chirp.id} chirp={chirp} />
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
          title="Todavía no hay publicaciones"
          description="Cuando publique, sus tweets aparecerán aquí."
        />
      )}
    </section>
  );
}
