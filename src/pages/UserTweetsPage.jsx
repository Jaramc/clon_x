import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TweetCard from '../components/common/TweetCard';
import { getFeed } from '../services/tweetService';

// Page to display tweets from a single user
function UserTweetsPage() {
  const [userTweets, setUserTweets] = useState([]);

  useEffect(() => {
    const allTweets = getFeed();
    // Simulate filtering tweets for a specific user
    const filteredTweets = allTweets.filter((tweet) => tweet.authorUsername === 'maria_gonzalez');
    setUserTweets(filteredTweets);
  }, []);

  return (
    <section style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h1>Tweets del usuario</h1>
        <p style={{ color: '#657786' }}>Mostrando publicaciones de @maria_gonzalez</p>
        <Link to="/feed" style={{ color: '#1da1f2', textDecoration: 'none' }}>
          ← Volver al Feed
        </Link>
      </div>

      <div>
        {userTweets.map((tweet) => (
          <TweetCard key={tweet.id} tweet={tweet} />
        ))}
      </div>
    </section>
  );
}

export default UserTweetsPage;
