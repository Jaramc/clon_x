import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import Toast from '../components/common/Toast';
import { createTweet } from '../services/tweetService';
import { MAX_TWEET_LENGTH } from '../lib/validators';

// Page to compose and publish a new tweet with 280 character limit and Toast feedback
export default function ComposePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast, clearToast } = useToast();

  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const maxLength = MAX_TWEET_LENGTH || 280;
  const remaining = maxLength - text.length;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = text.trim();

    if (!trimmed) {
      setError('Por favor, escribe algo antes de publicar.');
      return;
    }

    if (trimmed.length > maxLength) {
      setError(`La publicación supera el límite máximo de ${maxLength} caracteres.`);
      return;
    }

    setError('');
    setBusy(true);

    try {
      await createTweet(user, trimmed);
      showToast('¡Tu publicación se publicó correctamente en Firestore!', 'success');
      setText('');

      // Allow user to see the Toast notification before redirecting
      setTimeout(() => {
        navigate('/', {
          replace: true,
          state: { notice: '¡Tu publicación se publicó correctamente!' },
        });
      }, 1200);
    } catch (err) {
      setError(err?.message || 'No se pudo publicar. Inténtalo de nuevo.');
      showToast(err?.message || 'Error al guardar la publicación.', 'error');
      setBusy(false);
    }
  };

  const displayName = user?.name || user?.fullName || user?.username || 'Usuario';
  const initial = displayName.slice(0, 1).toUpperCase();

  // Dynamic counter color warning: normal -> warning (<= 40 left) -> critical (<= 0 left)
  const getCounterColor = () => {
    if (remaining <= 0) return '#ff7b72';
    if (remaining <= 40) return '#ffd166';
    return 'var(--muted, #71767b)';
  };

  return (
    <section>
      <header
        className="page-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '12px 16px',
        }}
      >
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
            disabled={busy}
          />

          <div className="compose-actions">
            <span
              className="counter"
              style={{
                color: getCounterColor(),
                fontWeight: remaining <= 40 ? 'bold' : 'normal',
                fontSize: '13px',
              }}
            >
              {text.length}/{maxLength} ({remaining} restantes)
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

            <button
              className="button"
              disabled={!text.trim() || text.length > maxLength || busy}
              type="submit"
            >
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

      {/* Visual Toast notification component */}
      <Toast toast={toast} onClose={clearToast} />
    </section>
  );
}