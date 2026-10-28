import { readStore, writeStore, makeId } from "../lib/storage";
import { getUsers, getUserByUsername } from "./userService";
function allFollows() { return readStore("follows", []); }
export function getFollowingIds(userId) { return allFollows().filter((f) => f.followerId === userId).map((f) => f.followingId); }
export function getFollowerIds(userId) { return allFollows().filter((f) => f.followingId === userId).map((f) => f.followerId); }
export function getFollowingUsers(userId) { const ids = getFollowingIds(userId); return getUsers().filter((u) => ids.includes(u.id)); }
export function getFollowerUsers(userId) { const ids = getFollowerIds(userId); return getUsers().filter((u) => ids.includes(u.id)); }
export function followByUsername(currentUser, username) {
  const target = getUserByUsername(username);
  if (!target) throw new Error("No encontramos un usuario con ese nombre.");
  if (target.id === currentUser.id) throw new Error("No puedes seguirte a ti mismo.");
  const follows = allFollows();
  if (follows.some((f) => f.followerId === currentUser.id && f.followingId === target.id)) throw new Error("Ya sigues a ese usuario.");
  writeStore("follows", [...follows, { id: makeId(), followerId: currentUser.id, followingId: target.id }]);
  return target;
}
export function unfollowUser(currentUser, targetId) {
  writeStore("follows", allFollows().filter((f) => !(f.followerId === currentUser.id && f.followingId === targetId)));
}
