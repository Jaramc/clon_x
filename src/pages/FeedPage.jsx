import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TweetCard from '../components/common/TweetCard';
import { getFeed } from '../services/tweetService';

// Main feed page showing all tweets
function FeedPage() {
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    const data = getFeed();
    setTweets(data);
  }, []);

  return (
    <section style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h1>Feed de Tweets</h1>
        <Link
          to="/compose"
          style={{
            backgroundColor: '#1da1f2',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '20px',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          Twittear
        </Link>
      </div>

      <div>
        {tweets.map((tweet) => (
          <TweetCard key={tweet.id} tweet={tweet} />
        ))}
      </div>
    </section>
  );
}

export default FeedPage;
