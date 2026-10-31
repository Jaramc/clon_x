// Card component to display a single tweet
function TweetCard({ tweet }) {
  if (!tweet) {
    return null;
  }

  return (
    <article
      className="tweet-card"
      style={{
        border: '1px solid #e1e8ed',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        backgroundColor: '#ffffff',
      }}
    >
      <div style={{ marginBottom: '8px' }}>
        <strong>{tweet.authorName}</strong>{' '}
        <span style={{ color: '#657786' }}>@{tweet.authorUsername}</span>
      </div>

      <p style={{ margin: '8px 0', fontSize: '15px', color: '#14171a' }}>{tweet.content}</p>

      {/* Date strictly placed at the bottom, below content */}
      <div style={{ marginTop: '8px', fontSize: '12px', color: '#657786' }}>
        <span>Publicado: {tweet.createdAt}</span>
        <span style={{ marginLeft: '16px' }}>❤️ {tweet.likes}</span>
      </div>
    </article>
  );
}

export default TweetCard;
