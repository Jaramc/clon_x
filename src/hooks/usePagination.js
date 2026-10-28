import { useMemo, useState } from "react";
export default function usePagination(items, pageSize = 10) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, pages);
  const data = useMemo(() => items.slice((currentPage - 1) * pageSize, currentPage * pageSize), [items, currentPage, pageSize]);
  return { data, page: currentPage, pages, setPage, hasPrevious: currentPage > 1, hasNext: currentPage < pages };
}
