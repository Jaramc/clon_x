export default function EmptyState({ title = "No hay contenido todavía", description = "Cuando haya novedades, aparecerán aquí." }) {
  return <div className="empty-state"><h3>{title}</h3><p>{description}</p></div>;
}
