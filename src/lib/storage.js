const PREFIX = "clonx:";
export function readStore(key, fallback = []) {
  try {
    const value = localStorage.getItem(PREFIX + key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
export function writeStore(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}
export function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
