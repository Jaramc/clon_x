import { readStore, writeStore } from "../lib/storage";
import { createUser, getUserByUsername } from "./userService";
import { validateRegistration } from "../lib/validators";

const SESSION_KEY = "session";
export function getSession() { return readStore(SESSION_KEY, null); }
export function registerUser(values) {
  const errors = validateRegistration(values);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  const user = createUser(values);
  const safeUser = { id: user.id, username: user.username, name: user.name, email: user.email, bio: user.bio, avatar: user.avatar };
  writeStore(SESSION_KEY, safeUser);
  return safeUser;
}
export function loginUser(username, password) {
  const user = getUserByUsername(username);
  if (!user || user.demoPassword !== password) throw new Error("Usuario o contraseña incorrectos.");
  const safeUser = { id: user.id, username: user.username, name: user.name, email: user.email, bio: user.bio, avatar: user.avatar };
  writeStore(SESSION_KEY, safeUser);
  return safeUser;
}
export function logoutUser() { localStorage.removeItem("clonx:" + SESSION_KEY); }
export function loginWithGoogle() {
  throw new Error("El inicio con Google estará disponible cuando configuremos Firebase Authentication.");
}
