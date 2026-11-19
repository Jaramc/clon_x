import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import Toast from '../components/common/Toast';
import { createTweet } from '../services/tweetService';
import { MAX_TWEET_LENGTH } from '../lib/validators';

export default function ComposePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast, clearToast } = useToast();
  const fileInputRef = useRef(null);

  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const maxLength = MAX_TWEET_LENGTH || 280;
  const remaining = maxLength - text.length;

  // Read file and convert to Base64 string
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona un archivo de imagen válido.');
      return;
    }

    // Base64 grows ~33%: 700 KB -> ~956 KB, under the 1 MiB Firestore document limit
    if (file.size > 700 * 1024) {
      setError('La imagen es demasiado pesada. Elige una imagen de menos de 700 KB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result);
    };
    reader.onerror = () => {
      setError('No se pudo procesar la imagen seleccionada.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = text.trim();

    if (!trimmed && !imageUrl) {
      setError('Por favor, escribe algo o adjunta una imagen antes de publicar.');
      return;
    }

    if (trimmed.length > maxLength) {
      setError(`La publicación supera el límite máximo de ${maxLength} caracteres.`);
      return;
    }

    setError('');
    setBusy(true);

    try {
      await createTweet(user, trimmed, imageUrl);
      showToast('¡Tu publicación se publicó correctamente en Firestore!', 'success');
      setText('');
      setImageUrl(null);

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
            disabled={busy}
          />

          {/* Base64 image preview with removal action */}
          {imageUrl && (
            <div
              style={{
                position: 'relative',
                marginTop: '10px',
                width: 'fit-content',
                maxWidth: '100%',
              }}
            >
              <img
                src={imageUrl}
                alt="Vista previa adjunta"
                style={{
                  maxHeight: '260px',
                  maxWidth: '100%',
                  borderRadius: '12px',
                  border: '1px solid var(--line)',
                  display: 'block',
                  objectFit: 'cover',
                }}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(0, 0, 0, 0.75)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  fontSize: '18px',
                  lineHeight: '28px',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
                aria-label="Eliminar imagen"
                title="Eliminar imagen"
              >
                ×
              </button>
            </div>
          )}

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            disabled={busy}
          />

          <div
            className="compose-actions"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            {/* Attachment trigger button */}
            <button
              type="button"
              className="button button--outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              style={{
                fontSize: '13px',
                padding: '6px 12px',
              }}
            >
              {imageUrl ? 'Cambiar imagen' : 'Adjuntar imagen'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
                disabled={(!text.trim() && !imageUrl) || text.length > maxLength || busy}
                type="submit"
              >
                {busy ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>

          {error && (
            <p className="form-error" role="alert" style={{ marginTop: '8px' }}>
              {error}
            </p>
          )}
        </div>
      </form>

      <Toast toast={toast} onClose={clearToast} />
    </section>
  );
}
