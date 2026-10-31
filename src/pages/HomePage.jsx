import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import useAuth from '../hooks/useAuth';
import FeedPage from './FeedPage';
import FollowSearchForm from '../components/common/FollowSearchForm';

// Home page with real-time Firestore followers/following counters and integrated feed
export default function HomePage() {
  const { user, loading } = useAuth();
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);

  const userId = user?.id || user?.uid;

  // Real-time listener for followers and following counts on the 'follows' collection
  useEffect(() => {
    if (!userId) {
      setFollowingCount(0);
      setFollowersCount(0);
      return undefined;
    }

    let unsubFollowing = () => {};
    let unsubFollowers = () => {};

    try {
      // 1. Real-time count of people the current user follows
      const followingQuery = query(
        collection(db, 'follows'),
        where('followerId', '==', userId)
      );
      unsubFollowing = onSnapshot(
        followingQuery,
        (snapshot) => {
          setFollowingCount(snapshot.size);
        },
        (error) => {
          console.warn('Real-time following count fallback:', error.message);
        }
      );

      // 2. Real-time count of people following the current user
      const followersQuery = query(
        collection(db, 'follows'),
        where('followingId', '==', userId)
      );
      unsubFollowers = onSnapshot(
        followersQuery,
        (snapshot) => {
          setFollowersCount(snapshot.size);
        },
        (error) => {
          console.warn('Real-time followers count fallback:', error.message);
        }
      );
    } catch (err) {
      console.warn('Firestore real-time listeners unavailable:', err.message);
    }

    return () => {
      unsubFollowing();
      unsubFollowers();
    };
  }, [userId]);

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>
        Cargando inicio...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      {/* Real-time counters banner for Home dashboard */}
      <div
        className="home-profile-counts"
        style={{
          display: 'flex',
          gap: '24px',
          padding: '16px',
          borderBottom: '1px solid var(--line)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <Link to="/following" style={{ textDecoration: 'none' }}>
          <strong>{followingCount}</strong> <span style={{ color: 'var(--muted)' }}>Siguiendo</span>
        </Link>
        <Link to="/followers" style={{ textDecoration: 'none' }}>
          <strong>{followersCount}</strong> <span style={{ color: 'var(--muted)' }}>Seguidores</span>
        </Link>
      </div>

      {/* Quick follow by @username form */}
      <FollowSearchForm />

      {/* Main timeline feed with tabs and pagination */}
      <FeedPage />
    </div>
  );
}
