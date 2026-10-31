import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// Protected route checking authentication state
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>Cargando sesión...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children || <Outlet />;
}
