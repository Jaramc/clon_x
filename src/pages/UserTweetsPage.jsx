import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserByUsername } from "../services/userService";
import { getTweetsByUser } from "../services/tweetService";
import { getFollowerIds, getFollowingIds } from "../services/followService";
import useAuth from "../hooks/useAuth";
import ChirpCard from "../components/common/ChirpCard";
import FollowButton from "../components/common/FollowButton";
import EmptyState from "../components/common/EmptyState";
import Spinner from "../components/common/Spinner";

export default function UserTweetsPage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [target, setTarget] = useState(null);
  const [chirps, setChirps] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [myFollowingIds, setMyFollowingIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError("");
      try {
        const profile = await getUserByUsername(username);
        if (!profile) {
          if (active) setTarget(null);
          return;
        }

        const [profileChirps, followers, following, myFollowing] = await Promise.all([
          getTweetsByUser(profile.id),
          getFollowerIds(profile.id),
          getFollowingIds(profile.id),
          currentUser?.id ? getFollowingIds(currentUser.id) : Promise.resolve([]),
        ]);

        if (active) {
          setTarget(profile);
          setChirps(profileChirps);
          setFollowersCount(followers.length);
          setFollowingCount(following.length);
          setMyFollowingIds(myFollowing);
        }
      } catch (err) {
        if (active) setError(err.message || "No se pudo cargar el perfil.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => { active = false; };
  }, [username, currentUser?.id]);

  if (loading) return <Spinner />;
  if (error) return <p className="form-error" role="alert">{error}</p>;
  if (!target) return <EmptyState title="No encontramos ese perfil" description="Comprueba el nombre de usuario e inténtalo de nuevo." />;

  return (
    <section>
      <header className="page-header"><h1>{target.name}</h1></header>
      <div className="profile-banner" />
      <div className="profile-summary">
        <div className="avatar avatar--large">{(target.name || target.username).slice(0, 1).toUpperCase()}</div>
        <h2>{target.name}</h2>
        <p className="muted">@{target.username}</p>
        {target.bio && <p>{target.bio}</p>}
        <div className="profile-counts">
          <span><strong>{followingCount}</strong> Seguidos</span>
          <span><strong>{followersCount}</strong> Seguidores</span>
        </div>
        {currentUser?.id !== target.id && currentUser && (
          <FollowButton
            user={target}
            currentUser={currentUser}
            following={myFollowingIds.includes(target.id)}
            onChange={async () => {
              const [followers, following, myFollowing] = await Promise.all([
                getFollowerIds(target.id),
                getFollowingIds(target.id),
                getFollowingIds(currentUser.id),
              ]);
              setFollowersCount(followers.length);
              setFollowingCount(following.length);
              setMyFollowingIds(myFollowing);
            }}
          />
        )}
        {currentUser?.id === target.id && <p className="muted">Este es tu perfil.</p>}
      </div>
      <h3 className="section-heading">Publicaciones</h3>
      {chirps.length ? chirps.map((chirp) => <ChirpCard key={chirp.id} chirp={chirp} />) :
        <EmptyState title="Todavía no hay publicaciones" description="Cuando publique, sus chirps aparecerán aquí." />}
    </section>
  );
}
