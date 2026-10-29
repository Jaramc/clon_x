
import { useState } from 'react';
import './FollowButton.css';

function FollowButton({
  isFollowing = false,
  onToggle,
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    if (loading || disabled || typeof onToggle !== 'function') {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onToggle();
    } catch (err) {
      setError(err?.message || 'No se pudo actualizar el seguimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="follow-control">
      <button
        type="button"
        className={`follow-button ${isFollowing ? 'following' : ''}`}
        onClick={handleClick}
        disabled={loading || disabled || !onToggle}
        aria-pressed={isFollowing}
      >
        {loading ? 'Procesando...' : isFollowing ? 'Siguiendo' : 'Seguir'}
      </button>

      {error && (
        <span className="follow-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default FollowButton;
