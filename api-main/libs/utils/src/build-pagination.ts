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
    hasNext: Number(page) < Number(pageCount),
    hasPrev: Number(page) > 1,
  };
}
