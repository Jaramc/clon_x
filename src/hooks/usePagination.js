<<<<<<< HEAD

import { useState } from "react";

export default function usePagination(items = [], itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(items.length / itemsPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * itemsPerPage;

  const paginatedItems = items.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const nextPage = () => {
    setCurrentPage((prev) =>
      Math.min(prev + 1, totalPages)
    );
  };

  const previousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    currentPage: safeCurrentPage,
    totalPages,
    paginatedItems,
    nextPage,
    previousPage,
    goToPage,
  };
}
=======
import { useMemo, useState } from "react";
export default function usePagination(items, pageSize = 10) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, pages);
  const data = useMemo(() => items.slice((currentPage - 1) * pageSize, currentPage * pageSize), [items, currentPage, pageSize]);
  return { data, page: currentPage, pages, setPage, hasPrevious: currentPage > 1, hasNext: currentPage < pages };
}
>>>>>>> origin/feature/spa
