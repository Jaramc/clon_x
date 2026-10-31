
<<<<<<< HEAD
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
=======
import { useState } from "react";

import {
  followByUsername,
  unfollowUser,
} from "../../services/followService";

export default function FollowButton({
  user,
  currentUser,
  following,
  onChange,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleFollow = async () => {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      if (following) {
        await unfollowUser(currentUser, user.id);
      } else {
        await followByUsername(
          currentUser,
          user.username
        );
      }

      if (onChange) {
        await onChange();
      }
    } catch (err) {
      console.error("Error al actualizar seguimiento:", {
        code: err.code,
        message: err.message,
      });

      setError(
        err.message || "No se pudo actualizar el seguimiento."
      );
    } finally {
      setBusy(false);
>>>>>>> origin/feature/spa
    }
  };

  return (
<<<<<<< HEAD
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
=======
    <div>
      <button
        className={
          following
            ? "button button--outline"
            : "button"
        }
        onClick={handleFollow}
        disabled={busy}
        type="button"
      >
        {busy
          ? "Procesando..."
          : following
            ? "Siguiendo"
            : "Seguir"}
      </button>

      {error && (
        <small className="form-error" role="alert">
          {error}
        </small>
>>>>>>> origin/feature/spa
      )}
    </div>
  );
}
<<<<<<< HEAD

export default FollowButton;
=======
>>>>>>> origin/feature/spa
