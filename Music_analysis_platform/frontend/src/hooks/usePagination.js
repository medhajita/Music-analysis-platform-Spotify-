import { useState, useMemo } from 'react';

/**
 * Generic pagination hook
 * @param {Array} data - The array to paginate
 * @param {number} pageSize - Number of items per page
 */
const usePagination = (data = [], pageSize = 25) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const setPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    currentPage,
    totalPages,
    paginatedData,
    setPage,
    pageSize
  };
};

export default usePagination;
