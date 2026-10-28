import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import UserCard from "../components/common/UserCard";
import EmptyState from "../components/common/EmptyState";
import { getFollowerUsers, getFollowingIds } from "../services/followService";
export default function FollowersPage() {
  const { user } = useAuth(); const [, refresh] = useState(0); const [search, setSearch] = useState("");
  const users = getFollowerUsers(user.id).filter(u => `${u.name} ${u.username}`.toLowerCase().includes(search.toLowerCase()));
  const followingIds = getFollowingIds(user.id);
  return <section><header className="page-header"><h1>Seguidores</h1></header><div className="search-box"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar entre tus seguidores"/></div>{users.length ? users.map(u=><UserCard key={u.id} user={u} currentUser={user} followingIds={followingIds} onFollowChange={()=>refresh(v=>v+1)}/>) : <EmptyState title="Todavía no tienes seguidores" description="Cuando otras personas te sigan, aparecerán aquí."/>}</section>;
}
