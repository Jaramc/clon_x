import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import UserCard from "../components/common/UserCard";
import ChirpCard from "../components/common/ChirpCard";
import EmptyState from "../components/common/EmptyState";
import Spinner from "../components/common/Spinner";
import { getFollowerUsers, getFollowingIds } from "../services/followService";
import { getTweetsByUsers } from "../services/tweetService";

export default function FollowersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showListTweets, setShowListTweets] = useState(false);
  const [listTweets, setListTweets] = useState([]);
  const [tweetsLoading, setTweetsLoading] = useState(false);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    try {
      const [followers, following] = await Promise.all([
        getFollowerUsers(user.id),
        getFollowingIds(user.id),
      ]);
      setUsers(followers);
      setFollowingIds(following);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los seguidores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.id]);

  const toggleListTweets = async () => {
    if (showListTweets) {
      setShowListTweets(false);
      return;
    }

    setTweetsLoading(true);
    try {
      const tweets = await getTweetsByUsers(users.map((item) => item.id));
      setListTweets(tweets);
      setShowListTweets(true);
    } catch (err) {
      setError(err.message || "No se pudieron cargar las publicaciones.");
    } finally {
      setTweetsLoading(false);
    }
  };

  const filteredUsers = users.filter((item) =>
    `${item.name} ${item.username}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section>
      <header className="page-header"><h1>Seguidores</h1></header>
      <div className="list-tweets-action">
        <button type="button" className="button button--outline" onClick={toggleListTweets} disabled={tweetsLoading || loading || users.length === 0}>
          {tweetsLoading ? "Cargando publicaciones..." : showListTweets ? "Ocultar publicaciones" : "Ver publicaciones de tus seguidores"}
        </button>
      </div>
      {showListTweets && (listTweets.length ? listTweets.map((chirp) => <ChirpCard key={chirp.id} chirp={chirp} />) : <EmptyState title="Sin publicaciones" description="Las personas de esta lista todavía no tienen publicaciones." />)}
      <div className="search-box">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar entre tus seguidores" />
      </div>
      {loading ? <Spinner /> :
        error ? <p className="form-error" role="alert">{error}</p> :
        filteredUsers.length ? filteredUsers.map((item) =>
          <UserCard key={item.id} user={item} currentUser={user} followingIds={followingIds} onFollowChange={load} />
        ) :
        <EmptyState title="Todavía no tienes seguidores" description="Cuando otras personas te sigan, aparecerán aquí." />}
    </section>
  );
}
