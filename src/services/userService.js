import { readStore, writeStore, makeId } from "../lib/storage";
import { normalizeUsername } from "../lib/validators";
import { mockUsers } from "../mocks/mockUsers";

const seedUsers = () => {
  const existing = readStore("users", null);
  if (existing === null) writeStore("users", mockUsers);
};
export function getUsers() { seedUsers(); return readStore("users", []); }
export function getUserById(id) { return getUsers().find((u) => u.id === id) || null; }
export function getUserByUsername(username) {
  const normalized = normalizeUsername(username);
  return getUsers().find((u) => normalizeUsername(u.username) === normalized) || null;
}
export function createUser({ username, email, name, password }) {
  seedUsers();
  const users = readStore("users", []);
  if (users.some((u) => normalizeUsername(u.username) === normalizeUsername(username))) throw new Error("Ese nombre de usuario ya está registrado.");
  if (users.some((u) => (u.email || "").toLowerCase() === email.trim().toLowerCase())) throw new Error("Ese correo electrónico ya está registrado.");
  // Prototipo local únicamente: la autenticación real debe delegarse a Firebase Auth.
  const user = { id: makeId(), username: username.trim(), email: email.trim().toLowerCase(), name: (name || username).trim(), bio: "", avatar: (name || username).trim().slice(0, 2).toUpperCase(), demoPassword: password };
  writeStore("users", [...users, user]);
  return user;
}
