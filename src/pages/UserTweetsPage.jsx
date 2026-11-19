import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getUserByUsername } from '../services/userService';
import { getTweetsByUser } from '../services/tweetService';
import {
  subscribeToFollowCounts,
  subscribeToFollowStatus,
  getFollowCounts,
  isFollowing,
} from '../services/followService';
import useAuth from '../hooks/useAuth';
import usePagination from '../hooks/usePagination';
import useToast from '../hooks/useToast';
import TweetCard from '../components/common/TweetCard';
import FollowButton from '../components/common/FollowButton';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import Pagination from '../components/common/Pagination';
import Toast from '../components/common/Toast';

export default function UserTweetsPage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const { toast, showToast, clearToast } = useToast();

  const [target, setTarget] = useState(null);
  const [chirps, setChirps] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentId = currentUser?.id || currentUser?.uid;

  // Resolve target profile (current user or target username)
  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError('');

      try {
        let profile = null;

        // Fallback directly to logged-in user if on own profile or route /profile
        const isOwnUsername =
          currentUser &&
          (!username ||
            username === 'profile' ||
            username === currentUser.username ||
            username === currentId);

        if (isOwnUsername) {
          profile = currentUser;
        } else if (username) {
          profile = await getUserByUsername(username);
        }

        if (!profile) {
          if (active) setTarget(null);
          return;
        }

        const targetId = profile.id || profile.uid;
        const [initialCounts, initialFollowStatus] = await Promise.all([
          getFollowCounts(targetId),
          currentId && currentId !== targetId ? isFollowing(currentId, targetId) : false,
        ]);

        if (active) {
          setTarget(profile);
          setFollowersCount(initialCounts.followersCount || 0);
          setFollowingCount(initialCounts.followingCount || 0);
          setIsFollowingUser(Boolean(initialFollowStatus));
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
  }, [username, currentId, currentUser]);

  // Query chirps_v2 filtered by target userId with real-time snapshot
  useEffect(() => {
    const targetId = target?.id || target?.uid;
    if (!targetId) {
      setChirps([]);
      return undefined;
    }

    let active = true;
    let unsubscribeChirps = () => {};

    try {
      const chirpsQuery = query(
        collection(db, 'chirps_v2'),
        where('userId', '==', targetId)
      );

      unsubscribeChirps = onSnapshot(
        chirpsQuery,
        (snapshot) => {
          if (!active) return;
          const items = snapshot.docs
            .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          if (items.length > 0) {
            setChirps(items);
          } else {
            // Fallback for mock tweets if firestore has no documents
            getTweetsByUser(targetId).then((fallback) => {
              if (active) setChirps(fallback || []);
            });
          }
        },
        async (err) => {
          console.warn('Real-time tweets listener error, using fallback:', err.message);
          const fallback = await getTweetsByUser(targetId);
          if (active) setChirps(fallback || []);
        }
      );
    } catch (err) {
      console.warn('Error creating chirps query:', err.message);
      getTweetsByUser(targetId).then((fallback) => {
        if (active) setChirps(fallback || []);
      });
    }

    return () => {
      active = false;
      unsubscribeChirps();
    };
  }, [target?.id, target?.uid]);

  // Real-time subscriptions for follower/following counts and relationship status
  useEffect(() => {
    const targetId = target?.id || target?.uid;
    if (!targetId) return undefined;

    const unsubCounts = subscribeToFollowCounts(targetId, ({ followingCount: fCount, followersCount: folCount }) => {
      setFollowingCount(fCount);
      setFollowersCount(folCount);
    });

    let unsubStatus = () => {};
    if (currentId && currentId !== targetId) {
      unsubStatus = subscribeToFollowStatus(currentId, targetId, (status) => {
        setIsFollowingUser(status);
      });
    }

    return () => {
      unsubCounts();
      unsubStatus();
    };
  }, [target?.id, target?.uid, currentId]);

  // Handle follow/unfollow toggle from the profile header
  const handleFollowChange = async (newStatus) => {
    if (!currentUser || !target) return;
    const targetId = target.id || target.uid;

    try {
      if (newStatus) {
        showToast(`Ahora sigues a @${target.username}`, 'success');
      } else {
        showToast(`Has dejado de seguir a @${target.username}`, 'success');
      }

      // Proactively refresh counts in case fallback mode is running
      const updatedCounts = await getFollowCounts(targetId);
      setFollowersCount(updatedCounts.followersCount);
      setFollowingCount(updatedCounts.followingCount);
      setIsFollowingUser(Boolean(newStatus));
    } catch (err) {
      showToast(err?.message || 'Error al actualizar seguimiento', 'error');
    }
  };

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

  const targetId = target.id || target.uid;
  const isMe = currentId && targetId && currentId === targetId;

  return (
    <section>
      <header
        className="page-header"
        style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px' }}
      >
        <Link to="/feed" style={{ color: 'var(--text)', fontSize: '20px' }} aria-label="Volver al feed">
          ←
        </Link>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px' }}>{target.name || target.fullName || target.username}</h1>
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
            {chirps.length} {chirps.length === 1 ? 'publicación' : 'publicaciones'}
          </span>
        </div>
      </header>

      <div className="profile-banner" />

      <div className="profile-summary">
        <div className="avatar avatar--large">
          {(target.name || target.fullName || target.username || '?').slice(0, 1).toUpperCase()}
        </div>

        <h2>{target.name || target.fullName || target.username}</h2>
        <p className="muted">@{target.username}</p>
        {target.bio && <p style={{ margin: '8px 0' }}>{target.bio}</p>}

        {/* Dynamic real-time follower/following counters with links to their dedicated list views */}
        <div className="profile-counts" style={{ display: 'flex', gap: '20px', marginTop: '14px' }}>
          <Link
            to={`/users/${encodeURIComponent(target.username)}/following`}
            style={{ textDecoration: 'none' }}
          >
            <strong>{followingCount}</strong> <span style={{ color: 'var(--muted)' }}>Siguiendo</span>
          </Link>
          <Link
            to={`/users/${encodeURIComponent(target.username)}/followers`}
            style={{ textDecoration: 'none' }}
          >
            <strong>{followersCount}</strong> <span style={{ color: 'var(--muted)' }}>Seguidores</span>
          </Link>
        </div>

        {/* Follow toggle button directly in the profile header */}
        {!isMe && currentUser && (
          <div style={{ marginTop: '16px' }}>
            <FollowButton
              user={target}
              currentUser={currentUser}
              following={isFollowingUser}
              onChange={handleFollowChange}
            />
          </div>
        )}

        {isMe && (
          <p className="muted" style={{ marginTop: '12px', fontSize: '13px' }}>
            Este es tu perfil personal.
          </p>
        )}
      </div>

      <h3 className="section-heading" style={{ marginTop: '16px', padding: '12px 16px' }}>
        Publicaciones
      </h3>

      {paginatedItems.length ? (
        <>
          <div>
            {paginatedItems.map((chirp) => (
              <TweetCard key={chirp.id} tweet={chirp} />
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
          title={isMe ? 'Aún no has publicado nada' : 'Todavía no hay publicaciones'}
          description={
            isMe
              ? 'Comparte tus pensamientos publicando tu primer tweet.'
              : 'Cuando publique, sus tweets aparecerán aquí.'
          }
        />
      )}

      {/* Floating feedback notification */}
      <Toast toast={toast} onClose={clearToast} />
    </section>
  );
}

