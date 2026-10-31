export const MAX_TWEET_LENGTH = 280;
export const normalizeUsername = (value = "") => value.trim().replace(/^@/, "").toLowerCase();
export const validateEmail = (value = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
export function validateRegistration({ username, email, password }) {
  const errors = {};
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username || "")) errors.username = "Usa de 3 a 20 letras, números o guiones bajos.";
  if (!validateEmail(email)) errors.email = "Escribe un correo electrónico válido.";
  if (!password || password.length < 8) errors.password = "La contraseña debe tener al menos 8 caracteres.";
  return errors;
}
