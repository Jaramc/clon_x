import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import FeedPage from './FeedPage';

// Home page rendering the main feed for authenticated users
export default function HomePage() {
  const { user, loading } = useAuth();

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

  return <FeedPage />;
}
