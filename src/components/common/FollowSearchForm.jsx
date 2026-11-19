import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { getUserByUsername } from '../../services/userService';
import { isFollowing } from '../../services/followService';
import UserCard from './UserCard';

// Reusable search form to follow any user by exact @username with instant validation and feedback
export default function FollowSearchForm({ onFollowSuccess }) {
  const { user } = useAuth();
  const [targetUsername, setTargetUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { user, following } | null

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
    setResult(null);
    setBusy(true);

    try {
      const found = await getUserByUsername(cleanUsername);
      if (!found) {
        setIsSuccess(false);
        setMessage('No encontramos un usuario con ese nombre.');
        return;
      }

      const currentId = user.id || user.uid;
      const targetId = found.id || found.uid;
      if (targetId === currentId) {
        setIsSuccess(false);
        setMessage('Ese es tu propio usuario.');
        return;
      }

      const alreadyFollowing = await isFollowing(currentId, targetId);
      setResult({ user: found, following: alreadyFollowing });
      if (alreadyFollowing) {
        setIsSuccess(true);
        setMessage(`Ya sigues a @${found.username}.`);
      }
    } catch (err) {
      setIsSuccess(false);
      setMessage(err?.message || 'No se pudo buscar el usuario.');
    } finally {
      setBusy(false);
    }
  };

  const handleFollowChange = (nowFollowing) => {
    setResult((prev) => (prev ? { ...prev, following: nowFollowing } : prev));
    setIsSuccess(true);
    setMessage(
      nowFollowing
        ? `¡Listo! Ahora sigues a @${result.user.username}.`
        : `Dejaste de seguir a @${result.user.username}.`
    );
    if (nowFollowing && typeof onFollowSuccess === 'function') {
      onFollowSuccess(result.user);
    }
  };

  return (
    <form
      className="follow-search"
      onSubmit={handleSubmit}
      style={{ padding: '16px', borderBottom: '1px solid var(--line)' }}
    >
      <label
        htmlFor="follow-search-input"
        style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}
      >
        Buscar usuario por nombre de usuario (@username)
      </label>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          id="follow-search-input"
          value={targetUsername}
          onChange={(e) => {
            setTargetUsername(e.target.value);
            setResult(null);
            setMessage('');
          }}
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
          {busy ? 'Buscando...' : 'Buscar'}
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

      {result && (
        <UserCard
          user={result.user}
          currentUser={user}
          followingIds={result.following ? [result.user.id || result.user.uid] : []}
          onFollowChange={handleFollowChange}
        />
      )}
    </form>
  );
}
