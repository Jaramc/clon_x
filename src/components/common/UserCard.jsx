<<<<<<< HEAD

import { Link } from 'react-router-dom';
import './UserCard.css';

function UserCard({ user, children }) {
  if (!user) {
    return null;
  }

  const initial = user.fullName?.charAt(0).toUpperCase() || '?';

  return (
    <article className="user-card">
      <div className="user-avatar" aria-hidden="true">
        {initial}
      </div>

      <div className="user-info">
        <Link
          to={`/users/${encodeURIComponent(user.username)}`}
          className="user-name"
        >
          {user.fullName}
        </Link>

        <span className="user-username">
          @{user.username}
        </span>
      </div>

      <div className="user-actions">
        {children}
      </div>
    </article>
  );
}

export default UserCard;
=======
import { Link } from "react-router-dom";
import FollowButton from "./FollowButton";

export default function UserCard({ user, currentUser, followingIds = [], onFollowChange }) {
  return (
    <div className="user-card">
      <div className="avatar">{(user.name || user.username).slice(0, 1).toUpperCase()}</div>
      <div className="user-card-info">
        <Link to={`/users/${user.username}`}><strong>{user.name}</strong></Link>
        <span>@{user.username}</span>
        {user.bio && <p>{user.bio}</p>}
        <Link className="user-card-posts-link" to={`/users/${user.username}`}>Ver publicaciones</Link>
      </div>
      {currentUser && currentUser.id !== user.id && (
        <FollowButton
          user={user}
          currentUser={currentUser}
          following={followingIds.includes(user.id)}
          onChange={onFollowChange}
        />
      )}
    </div>
  );
}
>>>>>>> origin/feature/spa
