import { mockTweets } from '../mocks/mockTweets';

// In-memory tweets array copied from mocks
let tweets = [...mockTweets];

// Get all tweets for the feed
export function getFeed() {
  return tweets;
}

// Add a new tweet to the list
export function createTweet(content) {
  const newTweet = {
    id: `tweet-${Date.now()}`,
    authorName: 'Mi Usuario',
    authorUsername: 'usuario_demo',
    content,
    likes: 0,
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
  };

  tweets = [newTweet, ...tweets];
  return newTweet;
}
