export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  return <div className={`toast toast--${toast.type}`} role="status"><span>{toast.message}</span><button className="toast-close" onClick={onClose} aria-label="Cerrar notificación">×</button></div>;
}
