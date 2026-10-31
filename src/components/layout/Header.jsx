<<<<<<< HEAD
import { Link } from 'react-router-dom';
import './Header.css';

// Basic Header component with logo, username, and logout button
function Header() {
  // Mock user data for Milestone 1
  const currentUser = {
    username: 'ximena_j',
  };

  // Simple handler to simulate logout
  const handleLogout = () => {
    // eslint-disable-next-line no-alert
    alert('Has cerrado sesión');
  };

  return (
    <header className="header">
      {/* Logo link back to home */}
      <Link to="/" className="header-logo" aria-label="Ir al inicio">
        𝕏
      </Link>

      {/* User info and logout button */}
      <div className="header-user">
        <span>@{currentUser.username}</span>
        <button type="button" className="logout-button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

export default Header;
=======
import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = () => { logout(); navigate("/login"); };
  return <aside className="sidebar"><NavLink to="/" className="brand" aria-label="Clon X inicio"><span className="brand-x">𝕏</span></NavLink><nav className="main-nav"><NavLink to="/" end><span>⌂</span> Inicio</NavLink><NavLink to="/compose"><span>✎</span> Publicar</NavLink>{user && <><NavLink to={`/users/${user.username}`}><span>♙</span> Perfil</NavLink><NavLink to="/following"><span>♧</span> Seguidos</NavLink><NavLink to="/followers"><span>♧</span> Seguidores</NavLink></>}</nav>{user && <div className="sidebar-bottom"><div className="avatar">{(user.name || user.username).slice(0,1).toUpperCase()}</div><div className="sidebar-user"><strong>{user.name}</strong><span>@{user.username}</span></div><button className="icon-button" title="Cerrar sesión" onClick={signOut}>↪</button></div>}</aside>;
}
>>>>>>> origin/feature/spa
