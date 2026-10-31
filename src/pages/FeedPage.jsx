import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ChirpCard from '../components/common/ChirpCard';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import Pagination from '../components/common/Pagination';
import useAuth from '../hooks/useAuth';
import usePagination from '../hooks/usePagination';
import { getTweets } from '../services/tweetService';
import { getFollowerIds, getFollowingIds } from '../services/followService';

// Unified FeedPage with tabs, real data, and pagination
export default function FeedPage() {
  const { user } = useAuth();
  const location = useLocation();

  const [chirps, setChirps] = useState([]);
  const [activeTab, setActiveTab] = useState('forYou'); // 'forYou' | 'following'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followedIdsList, setFollowedIdsList] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadFeed() {
      setLoading(true);
      setError('');

      try {
        const userId = user?.id || user?.uid;
        const [allChirps, followedIds, followerIds] = await Promise.all([
          getTweets(),
          userId ? getFollowingIds(userId).catch(() => []) : Promise.resolve([]),
          userId ? getFollowerIds(userId).catch(() => []) : Promise.resolve([]),
        ]);

        if (active) {
          setFollowedIdsList(followedIds || []);
          setFollowingCount((followedIds || []).length);
          setFollowersCount((followerIds || []).length);

          // Milestone 2 requirement: Own tweets + people in following + followers
          if (userId) {
            const visibleIds = new Set([userId, ...(followedIds || []), ...(followerIds || [])]);
            setChirps(allChirps.filter((c) => visibleIds.has(c.userId || c.uid)));
          } else {
            setChirps(allChirps);
          }
        }
      } catch (err) {
        if (active) setError(err.message || 'No se pudo cargar el feed.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFeed();
    return () => {
      active = false;
    };
  }, [user?.id, user?.uid, location.key]);

  // Tab filtering: "Para ti" shows all; "Siguiendo" shows only followed users
  const displayedChirps =
    activeTab === 'following'
      ? chirps.filter((c) => followedIdsList.includes(c.userId || c.uid))
      : chirps;

  // Milestone 1 requirement: pagination with max 10 items
  const {
    currentPage,
    totalPages,
    paginatedItems,
    nextPage,
    previousPage,
    goToPage,
  } = usePagination(displayedChirps, 10);

  return (
    <section>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
        <h1 style={{ margin: 0, fontSize: '20px' }}>Inicio</h1>
        <Link
          to="/compose"
          className="button"
          style={{
            backgroundColor: 'var(--blue, #1da1f2)',
            color: '#ffffff',
            padding: '8px 16px',
            fontSize: '14px',
          }}
        >
          Twittear
        </Link>
      </header>

      <div className="feed-tabs">
        <span
          className={activeTab === 'forYou' ? 'active' : ''}
          onClick={() => setActiveTab('forYou')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          Para ti
        </span>
        <span
          className={activeTab === 'following' ? 'active' : ''}
          onClick={() => setActiveTab('following')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          Siguiendo
        </span>
      </div>

      {location.state?.notice && (
        <div className="inline-notice">{location.state.notice}</div>
      )}

      <div className="home-profile-counts" aria-label="Resumen de seguidores y seguidos">
        <Link to="/followers">
          <strong>{followersCount}</strong>
          <span>Seguidores</span>
        </Link>
        <Link to="/following">
          <strong>{followingCount}</strong>
          <span>Seguidos</span>
        </Link>
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
          title="Tu feed está esperando"
          description="Sigue a otros usuarios o publica tu primer tweet para comenzar."
        />
      )}
    </section>
  );
}
