import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// Login page with email/username and Google authentication
export default function LoginPage() {
  const { user, login, loginGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const destination = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/';

  if (user) {
    return <Navigate to={destination} replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      await login(username.trim(), password);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err?.message || 'Error al iniciar sesión');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setBusy(true);

    try {
      await loginGoogle();
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err?.message || 'Error al iniciar sesión con Google');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">𝕏</div>
      <h1>Inicia sesión en Clon X</h1>
      <p className="muted">Bienvenido de nuevo.</p>

      <form onSubmit={handleLogin} className="form-stack">
        <label>
          Correo o nombre de usuario
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            placeholder="correo@ejemplo.com o @usuario"
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Contraseña"
          />
        </label>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="button button--wide" disabled={busy}>
          {busy ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>

        <div className="or-divider">
          <span>o</span>
        </div>

        <button
          type="button"
          className="button button--google"
          onClick={handleGoogleLogin}
          disabled={busy}
        >
          Continuar con Google
        </button>
      </form>

      <p className="auth-switch">
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
}
