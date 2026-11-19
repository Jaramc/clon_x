export default function formatDate(value) {
  if (!value) return '';

  let date;
  if (typeof value.toDate === 'function') {
    // Firestore Timestamp
    date = value.toDate();
  } else if (typeof value === 'string') {
    // '2025-01-15 10:30' -> '2025-01-15T10:30' so Safari can parse it
    date = new Date(value.replace(' ', 'T'));
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
