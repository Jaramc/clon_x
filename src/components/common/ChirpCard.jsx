import formatDate from "../../lib/formatDate";

export default function ChirpCard({ chirp }) {
  return (
    <article className="tweet">
      <div className="avatar">
        {(chirp.name || chirp.username || "?").slice(0, 1).toUpperCase()}
      </div>
      <div className="tweet-content">
        <div className="tweet-meta">
          <strong>{chirp.name || chirp.username}</strong>
          <span>@{chirp.username}</span>
          <span>·</span>
          <time dateTime={chirp.createdAt}>
            {formatDate(chirp.createdAt)}
          </time>
        </div>
        <p>{chirp.text}</p>
      </div>
    </article>
  );
}
