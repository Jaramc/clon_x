import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

// Sidebar navigation header with user profile and logout functionality
export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (typeof logout === 'function') {
        await logout();
      }
    } finally {
      navigate('/login');
    }
  };

  const username = user?.username || 'usuario';
  const displayName = user?.name || user?.fullName || username;
  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <aside className="sidebar">
      <NavLink to="/" className="brand" aria-label="Clon X inicio">
        <span className="brand-x">𝕏</span>
      </NavLink>

      <nav className="main-nav">
        <NavLink to="/" end>
          <span>⌂</span> Inicio
        </NavLink>
        <NavLink to="/compose">
          <span>✎</span> Publicar
        </NavLink>
        {user && (
          <>
            <NavLink to={`/users/${username}`}>
              <span>♙</span> Perfil
            </NavLink>
            <NavLink to="/following">
              <span>♧</span> Seguidos
            </NavLink>
            <NavLink to="/followers">
              <span>♧</span> Seguidores
            </NavLink>
          </>
        )}
      </nav>

      {user && (
        <div className="sidebar-bottom">
          <div className="avatar">{initial}</div>
          <div className="sidebar-user">
            <strong>{displayName}</strong>
            <span>@{username}</span>
          </div>
          <button
            type="button"
            className="icon-button"
            title="Cerrar sesión"
            onClick={handleLogout}
          >
            ↪
          </button>
        </div>
      )}
    </aside>
  );
}
