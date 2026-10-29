
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
