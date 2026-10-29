
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';

function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="header">
      <Link to="/" className="header-logo" aria-label="Ir al inicio">
        𝕏
      </Link>

      <nav className="header-nav" aria-label="Navegación principal">
        <Link to="/">Inicio</Link>
        <Link to="/feed">Feed</Link>
        <Link to="/following">Seguidos</Link>
        <Link to="/followers">Seguidores</Link>
      </nav>

      <div className="header-user">
        <span>@{user?.username || 'invitado'}</span>

        <button
          type="button"
          className="logout-button"
          onClick={logout}
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

export default Header;
