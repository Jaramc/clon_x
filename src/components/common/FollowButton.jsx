
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
    }
  };

  return (
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
      )}
    </div>
  );
}
