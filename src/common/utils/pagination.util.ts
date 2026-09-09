export function getPagination(query: {
  page?: number | string;
  pageSize?: number | string;
}) {
  const page = Number(query?.page) || 1;
  const pageSize = Number(query?.pageSize) || 10;
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip, take: pageSize };
}

export function buildMeta(total: number, page: number, pageSize: number) {
  return {
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
