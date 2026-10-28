export default function Pagination({ page, pages, setPage, hasPrevious, hasNext }) {
  if (pages <= 1) return null;
  return <div className="pagination"><button disabled={!hasPrevious} onClick={() => setPage(page - 1)}>Anterior</button><span>Página {page} de {pages}</span><button disabled={!hasNext} onClick={() => setPage(page + 1)}>Siguiente</button></div>;
}
