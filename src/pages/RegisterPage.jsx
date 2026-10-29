import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { validateRegistration } from "../lib/validators";
export default function RegisterPage() {
  const { register } = useAuth(); const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const errors = validateRegistration(form);

    if (Object.keys(errors).length) {
      setError(Object.values(errors)[0]);
      return;
    }

    setBusy(true);

    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return <div className="auth-page"><div className="auth-brand">𝕏</div><h1>Crea tu cuenta</h1><p className="muted">Únete a la conversación.</p><form onSubmit={submit} className="form-stack"><label>Nombre completo<input name="name" value={form.name} onChange={update} placeholder="Tu nombre" maxLength={60} /></label><label>Nombre de usuario<input name="username" value={form.username} onChange={update} placeholder="ej. narcolas_21" required autoComplete="username" /></label><label>Correo electrónico<input name="email" type="email" value={form.email} onChange={update} placeholder="tu@correo.com" required autoComplete="email" /></label><label>Contraseña<input name="password" type="password" value={form.password} onChange={update} minLength={8} required autoComplete="new-password" /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button--wide" disabled={busy}>{busy ? "Creando cuenta…" : "Crear cuenta"}</button></form><p className="auth-switch">¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link></p><p className="fine-print">Versión de desarrollo local. Configura Firebase antes de usar cuentas reales.</p></div>;
}
