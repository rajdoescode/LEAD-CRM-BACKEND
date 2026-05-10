import { PAGINATION } from '../config/constants.js';

/**
 * Generic pagination utility for in-memory arrays.
 *
 * Parses page/limit from query params, slices the dataset,
 * and returns both the paginated items and a standardized
 * pagination metadata object ready for ApiResponse.paginated().
 *
 * @param {Array}  dataset     - Full array of items to paginate
 * @param {object} query       - Express req.query object
 * @param {number} [query.page=1]
 * @param {number} [query.limit=25]
 * @returns {{ items: Array, pagination: object }}
 *
 * @example
 *   const { items, pagination } = paginate(allLeads, req.query);
 *   ApiResponse.paginated(res, items, pagination, 'Leads fetched');
 */
const paginate = (dataset, query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    Math.max(1, parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT),
    PAGINATION.MAX_LIMIT
  );

  const total = dataset.length;
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.min(page, totalPages || 1);
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  const items = dataset.slice(startIndex, endIndex);

  return {
    items,
    pagination: {
      page: currentPage,
      limit,
      total,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  };
};

export default paginate;
