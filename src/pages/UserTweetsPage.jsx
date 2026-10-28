import { useParams } from "react-router-dom";
import { getUserByUsername } from "../services/userService";
import { getTweetsByUser } from "../services/tweetService";
import { getFollowerIds, getFollowingIds } from "../services/followService";
import useAuth from "../hooks/useAuth";
import TweetCard from "../components/common/TweetCard";
import EmptyState from "../components/common/EmptyState";
export default function UserTweetsPage() {
  const { username } = useParams(); const { user: currentUser } = useAuth();
  const target = getUserByUsername(username);
  if (!target) return <EmptyState title="No encontramos ese perfil" description="Comprueba el nombre de usuario e inténtalo de nuevo."/>;
  const tweets = getTweetsByUser(target.id);
  return <section><header className="page-header"><h1>{target.name}</h1></header><div className="profile-banner"/><div className="profile-summary"><div className="avatar avatar--large">{(target.name || target.username).slice(0,1).toUpperCase()}</div><h2>{target.name}</h2><p className="muted">@{target.username}</p>{target.bio && <p>{target.bio}</p>}<div className="profile-counts"><span><strong>{getFollowingIds(target.id).length}</strong> Seguidos</span><span><strong>{getFollowerIds(target.id).length}</strong> Seguidores</span></div>{currentUser?.id === target.id && <p className="muted">Este es tu perfil.</p>}</div><h3 className="section-heading">Publicaciones</h3>{tweets.length ? tweets.map(t => <TweetCard key={t.id} tweet={t}/>) : <EmptyState title="Todavía no hay publicaciones" description="Cuando publique, sus tweets aparecerán aquí."/>}</section>;
}
