<<<<<<< HEAD

import "./Pagination.css";

export default function Pagination({
  currentPage,
  totalPages,
  nextPage,
  previousPage,
  goToPage,
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="pagination" aria-label="Paginación">
      <button
        type="button"
        onClick={previousPage}
        disabled={currentPage === 1}
      >
        Anterior
      </button>

      <div className="pagination-pages">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
          (page) => (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              className={currentPage === page ? "active" : ""}
              aria-current={
                currentPage === page ? "page" : undefined
              }
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        onClick={nextPage}
        disabled={currentPage === totalPages}
      >
        Siguiente
      </button>
    </nav>
  );
=======
export default function Pagination({ page, pages, setPage, hasPrevious, hasNext }) {
  if (pages <= 1) return null;
  return <div className="pagination"><button disabled={!hasPrevious} onClick={() => setPage(page - 1)}>Anterior</button><span>Página {page} de {pages}</span><button disabled={!hasNext} onClick={() => setPage(page + 1)}>Siguiente</button></div>;
>>>>>>> origin/feature/spa
}
