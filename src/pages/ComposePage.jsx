import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { createTweet } from "../services/tweetService";
import { MAX_TWEET_LENGTH } from "../lib/validators";

export default function ComposePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      await createTweet(user, text);
      navigate("/", { state: { notice: "¡Tu publicación se publicó correctamente!" } });
    } catch (err) {
      setError(err.message || "No se pudo publicar. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <header className="page-header"><h1>Publicar</h1></header>
      <form className="compose-box" onSubmit={submit}>
        <div className="avatar">
          {(user?.name || user?.username || "?").slice(0, 1).toUpperCase()}
        </div>
        <div className="compose-main">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={MAX_TWEET_LENGTH}
            placeholder="¿Qué está pasando?"
            aria-label="Texto de la publicación"
            autoFocus
          />
          <div className="compose-actions">
            <span className={text.length > 260 ? "counter counter--near" : "counter"}>
              {text.length}/280
            </span>
            <button className="button" disabled={!text.trim() || busy}>
              {busy ? "Publicando..." : "Publicar"}
            </button>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
        </div>
      </form>
    </section>
  );
}
