import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { loginUser } from '../services/authService';

function LoginPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const destination = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/';

  if (user) {
    return <Navigate to={destination} replace />;
  }

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    try {
      const authenticatedUser = loginUser(username.trim(), password);

      setUser(authenticatedUser);

      navigate(destination, { replace: true });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <section className="login-page">
      <h1>Iniciar sesión en X</h1>
      <p>Bienvenido al Clon de X</p>

      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nombre de usuario"
            required
          />
        </div>

        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <button type="submit">Iniciar sesión</button>
      </form>
    </section>
  );
}

export default LoginPage;
