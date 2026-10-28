import { useState } from "react";
import { followByUsername, unfollowUser } from "../../services/followService";
export default function FollowButton({ user, currentUser, following, onChange }) {
  const [busy, setBusy] = useState(false);
  const click = () => {
    if (busy) return;
    setBusy(true);
    try {
      if (following) unfollowUser(currentUser, user.id);
      else followByUsername(currentUser, user.username);
      onChange?.();
    } catch (error) { window.alert(error.message); }
    finally { setBusy(false); }
  };
  return <button className={following ? "button button--outline" : "button"} onClick={click} disabled={busy}>{following ? "Siguiendo" : "Seguir"}</button>;
}
