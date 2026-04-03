/**
 * Builds a Mongoose-compatible filter object from query params.
 * Supports: type, category, startDate, endDate, minAmount, maxAmount
 */
const buildRecordFilter = (query, userId) => {
  const filter = { user: userId };

  if (query.type) {
    filter.type = query.type;
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) {
      // Include the entire end day
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }

  if (query.minAmount || query.maxAmount) {
    filter.amount = {};
    if (query.minAmount) filter.amount.$gte = parseFloat(query.minAmount);
    if (query.maxAmount) filter.amount.$lte = parseFloat(query.maxAmount);
  }

  return filter;
};

/**
 * Parses and returns pagination options from query params.
 * Defaults: page=1, limit=10, maxLimit=100
 */
const getPaginationOptions = (query, maxLimit = 100) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Builds pagination metadata returned in responses.
 */
const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Returns a sort object from query `sort` param.
 * Example: sort=-date  → { date: -1 }
 *          sort=amount → { amount: 1 }
 */
const getSortOptions = (query, defaultSort = { date: -1 }) => {
  if (!query.sort) return defaultSort;
  const field = query.sort.startsWith('-') ? query.sort.slice(1) : query.sort;
  const direction = query.sort.startsWith('-') ? -1 : 1;
  const allowedFields = ['date', 'amount', 'category', 'type', 'createdAt'];
  if (!allowedFields.includes(field)) return defaultSort;
  return { [field]: direction };
};

module.exports = { buildRecordFilter, getPaginationOptions, buildPaginationMeta, getSortOptions };
