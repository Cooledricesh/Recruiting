export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export const calculateOffset = (page: number, limit: number): number => {
  if (page <= 0 || limit <= 0) {
    return 0;
  }
  return (page - 1) * limit;
};

export const calculatePagination = (
  page: number,
  limit: number,
  total: number
): PaginationInfo => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const safeTotal = Math.max(0, total);

  const totalPages = Math.ceil(safeTotal / safeLimit);

  return {
    page: safePage,
    limit: safeLimit,
    total: safeTotal,
    totalPages: totalPages || 1,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };
};
