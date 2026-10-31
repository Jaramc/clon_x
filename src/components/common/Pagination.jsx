import './Pagination.css';

// Reusable pagination component supporting both page-index and stepper APIs
export default function Pagination({
  currentPage,
  totalPages,
  nextPage,
  previousPage,
  goToPage,
  page,
  pages,
  setPage,
  hasPrevious,
  hasNext,
}) {
  const current = currentPage || page || 1;
  const total = totalPages || pages || 1;

  if (total <= 1) {
    return null;
  }

  const handlePrev = previousPage || (() => setPage && setPage(current - 1));
  const handleNext = nextPage || (() => setPage && setPage(current + 1));
  const isPrevDisabled = hasPrevious !== undefined ? !hasPrevious : current <= 1;
  const isNextDisabled = hasNext !== undefined ? !hasNext : current >= total;

  return (
    <nav className="pagination" aria-label="Paginación">
      <button type="button" onClick={handlePrev} disabled={isPrevDisabled}>
        Anterior
      </button>

      <span>
        Página {current} de {total}
      </span>

      <button type="button" onClick={handleNext} disabled={isNextDisabled}>
        Siguiente
      </button>
    </nav>
  );
}
