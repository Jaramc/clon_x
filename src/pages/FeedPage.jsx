import { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ChirpCard from '../components/common/ChirpCard';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import Pagination from '../components/common/Pagination';
import useAuth from '../hooks/useAuth';
import usePagination from '../hooks/usePagination';
import { getTweets } from '../services/tweetService';
import { getFollowerIds, getFollowingIds } from '../services/followService';

// Real-time integrated feed combining own tweets, followed users, and followers in chronological order
export default function FeedPage() {
  const { user } = useAuth();
  const location = useLocation();

  const [rawTweets, setRawTweets] = useState([]);
  const [activeTab, setActiveTab] = useState('forYou'); // 'forYou' | 'following'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followedIds, setFollowedIds] = useState([]);
  const [followerIds, setFollowerIds] = useState([]);

  const userId = user?.id || user?.uid;

  // 1. Real-time listener for tweets collection ('chirps_v2') with fallback
  useEffect(() => {
    let active = true;
    let unsubscribeChirps = () => {};

    async function initFeed() {
      setLoading(true);
      setError('');

      try {
        // Initial fetch to ensure instant display
        const initialTweets = await getTweets();
        if (active) {
          setRawTweets(initialTweets || []);
        }

        // Real-time snapshot listener on Firestore
        const chirpsCollection = collection(db, 'chirps_v2');
        unsubscribeChirps = onSnapshot(
          chirpsCollection,
          (snapshot) => {
            if (!active) return;
            const updated = snapshot.docs
              .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            setRawTweets(updated);
          },
          (err) => {
            console.warn('Real-time chirps subscription fallback:', err.message);
          }
        );
      } catch (err) {
        if (active) setError(err.message || 'No se pudo cargar el feed.');
      } finally {
        if (active) setLoading(false);
      }
    }

    initFeed();

    return () => {
      active = false;
      unsubscribeChirps();
    };
  }, []);

  // 2. Real-time listeners for following and followers IDs
  useEffect(() => {
    if (!userId) {
      setFollowedIds([]);
      setFollowerIds([]);
      setFollowingCount(0);
      setFollowersCount(0);
      return undefined;
    }

    let unsubFollowing = () => {};
    let unsubFollowers = () => {};

    try {
      const followingQuery = query(
        collection(db, 'follows'),
        where('followerId', '==', userId)
      );
      unsubFollowing = onSnapshot(
        followingQuery,
        (snapshot) => {
          const ids = snapshot.docs.map((d) => d.data().followingId).filter(Boolean);
          setFollowedIds(ids);
          setFollowingCount(ids.length);
        },
        async () => {
          // Fallback async fetch
          const ids = await getFollowingIds(userId).catch(() => []);
          setFollowedIds(ids);
          setFollowingCount(ids.length);
        }
      );

      const followersQuery = query(
        collection(db, 'follows'),
        where('followingId', '==', userId)
      );
      unsubFollowers = onSnapshot(
        followersQuery,
        (snapshot) => {
          const ids = snapshot.docs.map((d) => d.data().followerId).filter(Boolean);
          setFollowerIds(ids);
          setFollowersCount(ids.length);
        },
        async () => {
          // Fallback async fetch
          const ids = await getFollowerIds(userId).catch(() => []);
          setFollowerIds(ids);
          setFollowersCount(ids.length);
        }
      );
    } catch (e) {
      console.warn('Real-time follow subscription fallback:', e.message);
    }

    return () => {
      unsubFollowing();
      unsubFollowers();
    };
  }, [userId]);

  // 3. Milestone 2 requirement: Combine own tweets + followed + followers in chronological order
  const filteredChirps = useMemo(() => {
    if (!userId) {
      return rawTweets;
    }

    // Set of allowed authors: myself + people I follow + people who follow me
    const forYouAllowed = new Set([userId, ...followedIds, ...followerIds]);
    const followingAllowed = new Set(followedIds);

    const targetSet = activeTab === 'following' ? followingAllowed : forYouAllowed;

    return rawTweets
      .filter((chirp) => targetSet.has(chirp.userId || chirp.uid))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [rawTweets, userId, followedIds, followerIds, activeTab]);

  // 4. Milestone 1 requirement: pagination with max 10 items
  const {
    currentPage,
    totalPages,
    paginatedItems,
    nextPage,
    previousPage,
    goToPage,
  } = usePagination(filteredChirps, 10);

  return (
    <section>
      <header
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
        }}
      >
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

      {/* Tabs: "Para ti" (own + followed + followers) vs "Siguiendo" (only followed) */}
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

      {/* Live counts summary */}
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
          title={
            activeTab === 'following'
              ? 'No hay publicaciones de tus seguidos'
              : 'Tu feed está esperando'
          }
          description={
            activeTab === 'following'
              ? 'Sigue a más personas para ver qué están compartiendo.'
              : 'Publica tu primer tweet o sigue a otros usuarios para llenar tu feed.'
          }
        />
      )}
    </section>
  );
}
