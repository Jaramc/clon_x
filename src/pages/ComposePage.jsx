import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { createTweet } from '../services/tweetService';
import { MAX_TWEET_LENGTH } from '../lib/validators';

// Page to compose and publish a new tweet with 280 character limit
export default function ComposePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const maxLength = MAX_TWEET_LENGTH || 280;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = text.trim();

    if (!trimmed) {
      setError('Por favor, escribe algo antes de publicar.');
      return;
    }

    setError('');
    setBusy(true);

    try {
      await createTweet(user, trimmed);
      navigate('/', {
        replace: true,
        state: { notice: '¡Tu publicación se publicó correctamente!' },
      });
    } catch (err) {
      setError(err?.message || 'No se pudo publicar. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const displayName = user?.name || user?.fullName || user?.username || 'Usuario';
  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <section>
      <header className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px' }}>
        <Link to="/" style={{ color: 'var(--text)', fontSize: '20px' }}>
          ←
        </Link>
        <h1 style={{ margin: 0, fontSize: '20px' }}>Publicar</h1>
      </header>

      <form className="compose-box" onSubmit={handleSubmit}>
        <div className="avatar">{initial}</div>

        <div className="compose-main">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={maxLength}
            placeholder="¿Qué está pasando?"
            aria-label="Texto de la publicación"
            autoFocus
          />

          <div className="compose-actions">
            <span className={text.length > maxLength - 20 ? 'counter counter--near' : 'counter'}>
              {text.length}/{maxLength}
            </span>

            <Link
              to="/"
              style={{
                color: 'var(--muted)',
                fontSize: '14px',
                textDecoration: 'none',
              }}
            >
              Cancelar
            </Link>

            <button className="button" disabled={!text.trim() || busy} type="submit">
              {busy ? 'Publicando...' : 'Publicar'}
            </button>
          </div>

          {error && (
            <p className="form-error" role="alert" style={{ marginTop: '8px' }}>
              {error}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}