
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Header from './Header';
import './MainLayout.css';

function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="main-layout">
      <Header user={user} onLogout={logout} />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
