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
