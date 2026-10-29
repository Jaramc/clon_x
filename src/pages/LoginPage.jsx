import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
export default function LoginPage() {
  const { login, loginGoogle } = useAuth(); const navigate = useNavigate();
  const [username, setUsername] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };
  const google = async () => { try { await loginGoogle(); navigate("/"); } catch (err) { setError(err.message); } };
  return <div className="auth-page"><div className="auth-brand">𝕏</div><h1>Inicia sesión en Clon X</h1><form onSubmit={submit} className="form-stack"><label>Nombre de usuario<input value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" placeholder="@usuario" /></label><label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button--wide">Iniciar sesión</button><div className="or-divider"><span>o</span></div><button type="button" className="button button--google" onClick={google}>Continuar con Google</button></form><p className="auth-switch">¿No tienes cuenta? <Link to="/register">Regístrate</Link></p><p className="fine-print">Google requiere configurar Firebase Authentication.</p></div>;
}
