import { useMemo, useState } from 'react';

// Hook for client-side pagination supporting both API conventions
export default function usePagination(items = [], itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = itemsPerPage;

  const totalPages = Math.max(1, Math.ceil((items || []).length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;

  const paginatedItems = useMemo(
    () => (items || []).slice(startIndex, startIndex + pageSize),
    [items, startIndex, pageSize]
  );

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const previousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return {
    currentPage: safeCurrentPage,
    totalPages,
    paginatedItems,
    nextPage,
    previousPage,
    goToPage,
    // Alias keys for compatibility with feature/spa
    data: paginatedItems,
    page: safeCurrentPage,
    pages: totalPages,
    setPage: setCurrentPage,
    hasPrevious: safeCurrentPage > 1,
    hasNext: safeCurrentPage < totalPages,
  };
}
