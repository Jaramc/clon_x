import { Link } from 'react-router-dom';
import FollowButton from './FollowButton';

// Reusable user card displaying profile info, link to posts, and follow toggle
export default function UserCard({
  user,
  currentUser,
  followingIds = [],
  onFollowChange,
  children,
}) {
  if (!user) return null;

  const displayName = user.name || user.fullName || user.username || 'Usuario';
  const initial = displayName.slice(0, 1).toUpperCase();
  const targetId = user.id || user.uid;
  const currentId = currentUser?.id || currentUser?.uid;
  const isFollowing = followingIds.includes(targetId);

  return (
    <article className="user-card">
      <div className="avatar">{initial}</div>
      <div className="user-card-info">
        <Link to={`/users/${encodeURIComponent(user.username)}`}>
          <strong>{displayName}</strong>
        </Link>
        <span>@{user.username}</span>
        {user.bio && <p>{user.bio}</p>}
        <Link className="user-card-posts-link" to={`/users/${encodeURIComponent(user.username)}`}>
          Ver publicaciones
        </Link>
      </div>

      <div className="user-actions">
        {children || (
          currentUser && currentId !== targetId && (
            <FollowButton
              user={user}
              currentUser={currentUser}
              following={isFollowing}
              onChange={onFollowChange}
            />
          )
        )}
      </div>
    </article>
  );
}
