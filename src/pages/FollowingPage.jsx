
<<<<<<< HEAD
import { useEffect, useMemo, useState } from 'react';
import UserCard from '../components/common/UserCard';
import Pagination from '../components/common/Pagination';
import { getFollowing } from '../services/followService';
import { useAuth } from '../hooks/useAuth';
import usePagination from '../hooks/usePagination';

function FollowingPage() {
  const { user } = useAuth();
  const currentUserId = user?.uid;

  const [following, setFollowing] = useState([]);

  useEffect(() => {
    if (!currentUserId) {
      setFollowing([]);
      return;
    }

    const loadFollowing = () => {
      const users = getFollowing(currentUserId);
      setFollowing(users);
    };

    loadFollowing();
  }, [currentUserId]);

  // Ordenar alfabéticamente por nombre completo
  const sortedFollowing = useMemo(() => {
    return [...following].sort((a, b) =>
      (a.fullName || a.username || '').localeCompare(
        b.fullName || b.username || '',
        'es',
        { sensitivity: 'base' }
      )
    );
  }, [following]);

  // Aplicar paginación: máximo 10 usuarios
  const {
    currentPage,
    totalPages,
    paginatedItems,
    nextPage,
    previousPage,
    goToPage,
  } = usePagination(sortedFollowing, 10);

  return (
    <section>
      <h2>Usuarios que sigo</h2>

      <p>Total de seguidos: {following.length}</p>

      {following.length === 0 ? (
        <p>Todavía no sigues a ningún usuario.</p>
      ) : (
        <>
          {paginatedItems.map((followedUser) => (
            <UserCard
              key={followedUser.uid}
              user={followedUser}
            />
          ))}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            nextPage={nextPage}
            previousPage={previousPage}
            goToPage={goToPage}
          />
        </>
=======
import { useCallback, useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import UserCard from "../components/common/UserCard";
import ChirpCard from "../components/common/ChirpCard";
import EmptyState from "../components/common/EmptyState";
import Spinner from "../components/common/Spinner";

import {
  followByUsername,
  getFollowingUsers,
} from "../services/followService";

import {
  getTweetsByUsers,
} from "../services/tweetService";

export default function FollowingPage() {
  const { user } = useAuth();

  const [followingIds, setFollowingIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [showListTweets, setShowListTweets] = useState(false);
  const [listTweets, setListTweets] = useState([]);
  const [tweetsLoading, setTweetsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) {
      setUsers([]);
      setFollowingIds([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const followedUsers = await getFollowingUsers(user.id);

      const ids = followedUsers.map((item) => item.id);

      setFollowingIds(ids);
      setUsers(followedUsers);
    } catch (err) {
      console.error("Error cargando seguidos:", err);

      setMessage(
        err.message || "No se pudo cargar la lista de seguidos."
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (event) => {
    event.preventDefault();

    setMessage("");
    setBusy(true);

    try {

      const followed = await followByUsername(user, target);

      setTarget("");

      setMessage(
        `Ahora sigues a @${followed.username}.`
      );

      await load();
    } catch (err) {
      console.error("Error siguiendo usuario:", err);

      setMessage(
        err.message || "No se pudo seguir a ese usuario."
      );
    } finally {
      setBusy(false);
    }
  };

  const toggleListTweets = async () => {
    if (showListTweets) {
      setShowListTweets(false);
      return;
    }

    setTweetsLoading(true);

    try {
      const tweets = await getTweetsByUsers(
        users.map((item) => item.id)
      );

      setListTweets(tweets);
      setShowListTweets(true);
    } catch (err) {
      console.error("Error cargando publicaciones:", err);

      setMessage(
        err.message || "No se pudieron cargar las publicaciones."
      );
    } finally {
      setTweetsLoading(false);
    }
  };

  const filteredUsers = users.filter((item) =>
    `${item.name || ""} ${item.username || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <section>
      <header className="page-header">
        <h1>Seguidos</h1>
      </header>

      <form
        className="follow-search"
        onSubmit={submit}
      >
        <label htmlFor="follow-username">
          Seguir por nombre de usuario
        </label>

        <div>
          <input
            id="follow-username"
            value={target}
            onChange={(event) =>
              setTarget(event.target.value)
            }
            placeholder="@nombredeusuario"
            required
          />

          <button
            className="button"
            disabled={busy || !user}
            type="submit"
          >
            {busy ? "Buscando..." : "Seguir"}
          </button>
        </div>

        {message && (
          <p
            className={
              message.startsWith("Ahora")
                ? "success-message"
                : "form-error"
            }
            role="status"
          >
            {message}
          </p>
        )}
      </form>

      <div className="list-tweets-action">
        <button
          type="button"
          className="button button--outline"
          onClick={toggleListTweets}
          disabled={
            tweetsLoading ||
            loading ||
            users.length === 0
          }
        >
          {tweetsLoading
            ? "Cargando publicaciones..."
            : showListTweets
              ? "Ocultar publicaciones"
              : "Ver publicaciones de tus seguidos"}
        </button>
      </div>

      {showListTweets && (
        listTweets.length > 0 ? (
          listTweets.map((chirp) => (
            <ChirpCard
              key={chirp.id}
              chirp={chirp}
            />
          ))
        ) : (
          <EmptyState
            title="Sin publicaciones"
            description="Las personas de esta lista todavía no tienen publicaciones."
          />
        )
      )}

      <div className="search-box">
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Buscar entre los usuarios que sigues"
        />
      </div>

      {loading ? (
        <Spinner />
      ) : filteredUsers.length > 0 ? (
        filteredUsers.map((item) => (
          <UserCard
            key={item.id}
            user={item}
            currentUser={user}
            followingIds={followingIds}
            onFollowChange={load}
          />
        ))
      ) : (
        <EmptyState
          title="Aún no sigues a nadie"
          description="Busca un nombre de usuario arriba para comenzar."
        />
>>>>>>> origin/feature/spa
      )}
    </section>
  );
}
<<<<<<< HEAD

export default FollowingPage;
=======
>>>>>>> origin/feature/spa
