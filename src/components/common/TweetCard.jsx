import formatDate from "../../lib/formatDate";
export default function TweetCard({ tweet }) {
  return <article className="tweet"><div className="avatar">{(tweet.name || tweet.username || "?").slice(0, 1).toUpperCase()}</div><div className="tweet-content"><div className="tweet-meta"><strong>{tweet.name || tweet.username}</strong><span>@{tweet.username}</span><span>·</span><time>{formatDate(tweet.createdAt)}</time></div><p>{tweet.text}</p></div></article>;
}
