import { useState } from "react";
import useAuth from "../hooks/useAuth";
import UserCard from "../components/common/UserCard";
import EmptyState from "../components/common/EmptyState";
import { followByUsername, getFollowingIds, getFollowingUsers } from "../services/followService";
export default function FollowingPage() {
  const { user } = useAuth(); const [, refresh] = useState(0); const [search, setSearch] = useState(""); const [target, setTarget] = useState(""); const [message, setMessage] = useState("");
  const followingIds = getFollowingIds(user.id);
  const users = getFollowingUsers(user.id).filter(u => `${u.name} ${u.username}`.toLowerCase().includes(search.toLowerCase()));
  const submit = (e) => { e.preventDefault(); setMessage(""); try { const followed = followByUsername(user, target); setTarget(""); setMessage(`Ahora sigues a @${followed.username}.`); refresh(v=>v+1); } catch (err) { setMessage(err.message); } };
  return <section><header className="page-header"><h1>Seguidos</h1></header><form className="follow-search" onSubmit={submit}><label htmlFor="follow-username">Seguir por nombre de usuario</label><div><input id="follow-username" value={target} onChange={e=>setTarget(e.target.value)} placeholder="@nombredeusuario" required/><button className="button">Seguir</button></div>{message && <p className={message.startsWith("Ahora") ? "success-message" : "form-error"} role="status">{message}</p>}</form><div className="search-box"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar entre los usuarios que sigues"/></div>{users.length ? users.map(u=><UserCard key={u.id} user={u} currentUser={user} followingIds={followingIds} onFollowChange={()=>refresh(v=>v+1)}/>) : <EmptyState title="Aún no sigues a nadie" description="Busca un nombre de usuario arriba para comenzar."/>}</section>;
}
