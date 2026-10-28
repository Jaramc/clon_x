import { readStore, writeStore, makeId } from "../lib/storage";
import { mockTweets } from "../mocks/mockTweets";
import { MAX_TWEET_LENGTH } from "../lib/validators";
let seeded = false;
function allTweets() {
  if (!seeded) {
    if (readStore("tweets", null) === null) writeStore("tweets", mockTweets);
    seeded = true;
  }
  return readStore("tweets", []);
}
export function getTweets() { return allTweets().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); }
export function getTweetsByUser(userId) { return getTweets().filter((tweet) => tweet.userId === userId); }
export function createTweet(user, text) {
  const trimmed = (text || "").trim();
  if (!trimmed) throw new Error("Escribe algo antes de publicar.");
  if (trimmed.length > MAX_TWEET_LENGTH) throw new Error("El tweet no puede superar los 280 caracteres.");
  const tweet = { id: makeId(), userId: user.id, username: user.username, name: user.name, text: trimmed, createdAt: new Date().toISOString() };
  writeStore("tweets", [tweet, ...allTweets()]);
  return tweet;
}
