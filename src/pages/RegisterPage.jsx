import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { validateRegistration } from '../lib/validators';

// User registration page with client validation and Firebase Auth integration
export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validateRegistration(form);
    if (Object.keys(errors).length) {
      setError(Object.values(errors)[0]);
      return;
    }

    setBusy(true);

    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.message || 'Error al crear la cuenta');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">𝕏</div>
      <h1>Crea tu cuenta</h1>
      <p className="muted">Únete a la conversación en Clon X.</p>

      <form onSubmit={handleSubmit} className="form-stack">
        <label>
          Nombre completo
          <input
            name="name"
            value={form.name}
            onChange={update}
            placeholder="Tu nombre completo"
            maxLength={60}
            required
          />
        </label>

        <label>
          Nombre de usuario
          <input
            name="username"
            value={form.username}
            onChange={update}
            placeholder="@usuario"
            required
            autoComplete="username"
          />
        </label>

        <label>
          Correo electrónico
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={update}
            placeholder="tu@correo.com"
            required
            autoComplete="email"
          />
        </label>

        <label>
          Contraseña
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={update}
            placeholder="Mínimo 6 caracteres"
            minLength={6}
            required
            autoComplete="new-password"
          />
        </label>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="button button--wide" disabled={busy}>
          {busy ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="auth-switch">
        ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}
