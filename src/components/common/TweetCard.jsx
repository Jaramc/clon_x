import formatDate from '../../lib/formatDate';

export default function TweetCard({ tweet }) {
  if (!tweet) return null;

  // Normalize mixed field names coming from mocks and Firestore
  const fullName = tweet.name || tweet.authorName || tweet.username || 'Usuario';
  const username = tweet.username || tweet.authorUsername || 'usuario';
  const text = tweet.text || tweet.content || '';
  const initial = fullName.slice(0, 1).toUpperCase();

  return (
    <article className="tweet">
      <div className="avatar">{initial}</div>
      <div className="tweet-content">
        <div className="tweet-meta">
          <strong>{fullName},</strong>
          <span>
            @{username} - <time dateTime={tweet.createdAt}>{formatDate(tweet.createdAt)}</time>
          </span>
        </div>
        {text && <p>{text}</p>}
        {typeof tweet.imageUrl === 'string' && tweet.imageUrl.startsWith('data:image/') && (
          <img
            className="tweet-image"
            src={tweet.imageUrl}
            alt={`Imagen publicada por @${username}`}
            loading="lazy"
          />
        )}
      </div>
    </article>
  );
}
