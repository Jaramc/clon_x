import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = () => { logout(); navigate("/login"); };
  return <aside className="sidebar"><NavLink to="/" className="brand" aria-label="Clon X inicio"><span className="brand-x">𝕏</span></NavLink><nav className="main-nav"><NavLink to="/" end><span>⌂</span> Inicio</NavLink><NavLink to="/compose"><span>✎</span> Publicar</NavLink>{user && <><NavLink to={`/users/${user.username}`}><span>♙</span> Perfil</NavLink><NavLink to="/following"><span>♧</span> Seguidos</NavLink><NavLink to="/followers"><span>♧</span> Seguidores</NavLink></>}</nav>{user && <div className="sidebar-bottom"><div className="avatar">{(user.name || user.username).slice(0,1).toUpperCase()}</div><div className="sidebar-user"><strong>{user.name}</strong><span>@{user.username}</span></div><button className="icon-button" title="Cerrar sesión" onClick={signOut}>↪</button></div>}</aside>;
}
