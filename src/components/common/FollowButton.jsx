import { useState } from 'react';
import { followUser, unfollowUser } from '../../services/followService';

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
  const [isHovered, setIsHovered] = useState(false);

  const activeFollowing = following !== undefined ? Boolean(following) : Boolean(isFollowing);

  const targetId = user?.id || user?.uid;
  const currentUserId = currentUser?.id || currentUser?.uid;

  // Prevent rendering if user tries to follow themselves
  if (currentUserId && targetId && currentUserId === targetId) {
    return null;
  }

  const handleAction = async (e) => {
    e?.stopPropagation?.();
    if (busy || disabled) return;

    setBusy(true);
    setError('');

    try {
      if (user && targetId) {
        if (activeFollowing) {
          await unfollowUser(currentUser, targetId);
        } else {
          await followUser(currentUser, targetId);
        }
      } else if (typeof onToggle === 'function') {
        await onToggle();
      }

      if (typeof onChange === 'function') {
        await onChange(!activeFollowing);
      }
    } catch (err) {
      console.error('Error al actualizar seguimiento:', err);
      setError(err?.message || 'No se pudo actualizar el seguimiento.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setBusy(false);
    }
  };

  const getButtonText = () => {
    if (busy) return 'Procesando...';
    if (activeFollowing) {
      return isHovered ? 'Dejar de seguir' : 'Siguiendo';
    }
    return 'Seguir';
  };

  const getButtonClass = () => {
    if (activeFollowing) {
      return isHovered
        ? 'button button--outline button--danger'
        : 'button button--outline';
    }
    return 'button';
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
      <button
        type="button"
        className={getButtonClass()}
        onClick={handleAction}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={busy || disabled}
        aria-pressed={activeFollowing}
        aria-busy={busy}
        style={{
          minWidth: '105px',
          transition: 'all 0.15s ease',
          borderColor: activeFollowing && isHovered ? '#ff4d4f' : undefined,
          color: activeFollowing && isHovered ? '#ff4d4f' : undefined,
        }}
      >
        {getButtonText()}
      </button>

      {error && (
        <span className="form-error" role="alert" style={{ fontSize: '11px', marginTop: '2px' }}>
          {error}
        </span>
      )}
    </div>
  );
}

