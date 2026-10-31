import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { followByUsername } from '../../services/followService';

// Reusable search form to follow any user by exact @username with instant validation and feedback
export default function FollowSearchForm({ onFollowSuccess }) {
  const { user } = useAuth();
  const [targetUsername, setTargetUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const cleanUsername = targetUsername.trim().replace(/^@/, '');

    if (!cleanUsername) {
      setMessage('Ingresa un nombre de usuario.');
      setIsSuccess(false);
      return;
    }

    if (!user) {
      setMessage('Debes iniciar sesión para seguir usuarios.');
      setIsSuccess(false);
      return;
    }

    setMessage('');
    setBusy(true);

    try {
      const followedUser = await followByUsername(user, cleanUsername);
      setIsSuccess(true);
      setMessage(`¡Genial! Ahora sigues a @${followedUser.username}.`);
      setTargetUsername('');

      if (typeof onFollowSuccess === 'function') {
        onFollowSuccess(followedUser);
      }
    } catch (err) {
      setIsSuccess(false);
      setMessage(err?.message || 'No se pudo seguir al usuario.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="follow-search" onSubmit={handleSubmit} style={{ padding: '16px', borderBottom: '1px solid var(--line)' }}>
      <label htmlFor="follow-search-input" style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>
        Seguir por nombre de usuario (@username)
      </label>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          id="follow-search-input"
          value={targetUsername}
          onChange={(e) => setTargetUsername(e.target.value)}
          placeholder="ej: @maria_gonzalez o ana_dev"
          disabled={busy}
          required
          style={{ flex: 1 }}
        />

        <button
          type="submit"
          className="button"
          disabled={busy || !targetUsername.trim()}
          style={{ minWidth: '100px' }}
        >
          {busy ? 'Buscando...' : 'Seguir'}
        </button>
      </div>

      {message && (
        <p
          className={isSuccess ? 'success-message' : 'form-error'}
          role="status"
          style={{ marginTop: '8px', fontSize: '13px' }}
        >
          {message}
        </p>
      )}
    </form>
  );
}
