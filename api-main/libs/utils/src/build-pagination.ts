export function buildPagination(
  page: number,
  limit: number,
  totalItems: number,
) {
  const pageCount = Math.ceil(totalItems / limit);
  return {
    total: Number(totalItems),
    page: Number(page),
    limit: Number(limit),
    totalPages: Number(pageCount),
    hasNextPage: Number(page) < Number(pageCount),
    hasPreviousPage: Number(page) > 1,
  };
}
