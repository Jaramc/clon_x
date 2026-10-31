import { useState } from 'react';
import { followByUsername, unfollowUser } from '../../services/followService';

// Reusable follow toggle button supporting both manual toggle callback and direct user entity
export default function FollowButton({
  user,
  currentUser,
  following,
  isFollowing,
  onChange,
  onToggle,
  disabled = false,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const activeFollowing = following !== undefined ? following : isFollowing;

  const handleAction = async () => {
    if (busy || disabled) return;

    setBusy(true);
    setError('');

    try {
      if (typeof onToggle === 'function') {
        await onToggle();
      } else if (user) {
        const targetId = user.id || user.uid;
        const targetUsername = user.username;

        if (activeFollowing) {
          await unfollowUser(currentUser, targetId);
        } else {
          await followByUsername(currentUser, targetUsername);
        }

        if (typeof onChange === 'function') {
          await onChange();
        }
      }
    } catch (err) {
      console.error('Error al actualizar seguimiento:', err);
      setError(err?.message || 'No se pudo actualizar el seguimiento.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
      <button
        type="button"
        className={activeFollowing ? 'button button--outline' : 'button'}
        onClick={handleAction}
        disabled={busy || disabled}
        aria-pressed={activeFollowing}
      >
        {busy ? 'Procesando...' : activeFollowing ? 'Siguiendo' : 'Seguir'}
      </button>

      {error && (
        <span className="form-error" role="alert" style={{ fontSize: '12px' }}>
          {error}
        </span>
      )}
    </div>
  );
}
