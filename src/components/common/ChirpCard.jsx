import formatDate from '../../lib/formatDate';

// Tweet / Chirp card component with date strictly at the bottom
export default function ChirpCard({ chirp }) {
  if (!chirp) return null;

  const authorName = chirp.name || chirp.authorName || chirp.username || 'Usuario';
  const authorUsername = chirp.username || chirp.authorUsername || 'anon';
  const text = chirp.text || chirp.content || '';
  const initial = authorName.slice(0, 1).toUpperCase();

  return (
    <article className="tweet">
      <div className="avatar">{initial}</div>
      <div className="tweet-content">
        <div className="tweet-meta">
          <strong>{authorName}</strong>
          <span>@{authorUsername}</span>
        </div>
        <p>{text}</p>
        {/* Date strictly positioned at the bottom, below content */}
        <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--muted)' }}>
          <time dateTime={chirp.createdAt}>
            Publicado: {typeof formatDate === 'function' ? formatDate(chirp.createdAt) : chirp.createdAt}
          </time>
        </div>
      </div>
    </article>
  );
}
