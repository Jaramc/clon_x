import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ChirpCard from "../components/common/ChirpCard";
import EmptyState from "../components/common/EmptyState";
import Spinner from "../components/common/Spinner";
import useAuth from "../hooks/useAuth";
import { getTweets } from "../services/tweetService";
import { getFollowerIds, getFollowingIds } from "../services/followService";
import { Link } from "react-router-dom";

export default function FeedPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [chirps, setChirps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadFeed() {
      if (!user?.id) return;
      setLoading(true);
      setError("");

      try {
        const [allChirps, followedIds, followerIds] = await Promise.all([
          getTweets(),
          getFollowingIds(user.id),
          getFollowerIds(user.id),
        ]);
        if (active) {
          const visibleIds = new Set([user.id, ...followedIds]);
          setChirps(allChirps.filter((chirp) => visibleIds.has(chirp.userId)));
          setFollowingCount(followedIds.length);
          setFollowersCount(followerIds.length);
        }
      } catch (err) {
        if (active) setError(err.message || "No se pudo cargar el feed.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFeed();
    return () => { active = false; };
  }, [user?.id, location.key]);

  return (
    <section>
      <header className="page-header">
        <h1>Inicio</h1>
        <div className="feed-tabs"><span className="active">Para ti</span><span>Siguiendo</span></div>
      </header>
      {location.state?.notice && <div className="inline-notice">{location.state.notice}</div>}
      <div className="home-profile-counts" aria-label="Resumen de seguidores y seguidos">
        <Link to="/followers"><strong>{followersCount}</strong><span>Seguidores</span></Link>
        <Link to="/following"><strong>{followingCount}</strong><span>Seguidos</span></Link>
      </div>
      {loading ? <Spinner /> :
        error ? <p className="form-error" role="alert">{error}</p> :
        chirps.length ? chirps.map((chirp) => <ChirpCard key={chirp.id} chirp={chirp} />) :
        <EmptyState title="Tu feed está esperando" description="Sigue a otros usuarios o publica tu primer chirp para comenzar." />}
    </section>
  );
}
