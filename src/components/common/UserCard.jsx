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
