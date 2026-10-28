import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import TweetCard from "../components/common/TweetCard";
import EmptyState from "../components/common/EmptyState";
import useAuth from "../hooks/useAuth";
import { getTweets } from "../services/tweetService";
import { getFollowingIds } from "../services/followService";
export default function FeedPage() {
  const { user } = useAuth(); const location = useLocation(); const [tweets, setTweets] = useState([]);
  const refresh = () => { const followed = getFollowingIds(user.id); setTweets(getTweets().filter((t) => t.userId === user.id || followed.includes(t.userId))); };
  useEffect(() => { refresh(); }, [user.id, location.key]);
  return <section><header className="page-header"><h1>Inicio</h1><div className="feed-tabs"><span className="active">Para ti</span><span>Siguiendo</span></div></header>{location.state?.notice && <div className="inline-notice">{location.state.notice}</div>}{tweets.length ? tweets.map((tweet) => <TweetCard key={tweet.id} tweet={tweet}/>) : <EmptyState title="Tu feed está esperando" description="Sigue a otros usuarios o publica tu primer tweet para comenzar."/>}</section>;
}
