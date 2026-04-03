const FinancialRecord = require('../models/record.model');
const AppError = require('../utils/AppError');
const {
  buildRecordFilter,
  getPaginationOptions,
  buildPaginationMeta,
  getSortOptions,
} = require('../utils/queryHelpers');

/**
 * Create a new financial record.
 */
const createRecord = async (data, userId) => {
  const record = await FinancialRecord.create({ ...data, user: userId });
  return record;
};

/**
 * Retrieve records with filtering, sorting, and pagination.
 * Admins see all records; other roles see only their own.
 */
const getRecords = async (query, requestingUser) => {
  const userId = requestingUser.role === 'admin' && query.userId
    ? query.userId
    : requestingUser._id;

  const filter = buildRecordFilter(query, userId);
  const { page, limit, skip } = getPaginationOptions(query);
  const sort = getSortOptions(query);

  // Search by description
  if (query.search) {
    filter.description = { $regex: query.search, $options: 'i' };
  }

  const [records, total] = await Promise.all([
    FinancialRecord.find(filter)
      .populate('user', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    FinancialRecord.countDocuments(filter),
  ]);

  return {
    records,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

/**
 * Retrieve a single record by ID.
 * Enforces ownership: non-admins can only read their own records.
 */
const getRecordById = async (recordId, requestingUser) => {
  const record = await FinancialRecord.findById(recordId).populate('user', 'name email role');
  if (!record) throw new AppError('Financial record not found.', 404);

  if (requestingUser.role !== 'admin' && record.user._id.toString() !== requestingUser._id.toString()) {
    throw new AppError('You do not have permission to access this record.', 403);
  }

  return record;
};

/**
 * Update a financial record.
 * Analysts and viewers can only edit their own; admins can edit any.
 */
const updateRecord = async (recordId, updateData, requestingUser) => {
  const record = await FinancialRecord.findById(recordId);
  if (!record) throw new AppError('Financial record not found.', 404);

  if (requestingUser.role !== 'admin' && record.user.toString() !== requestingUser._id.toString()) {
    throw new AppError('You do not have permission to update this record.', 403);
  }

  const allowedFields = ['amount', 'type', 'category', 'date', 'description'];
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) record[field] = updateData[field];
  });

  await record.save();
  return record;
};

/**
 * Soft-delete a financial record (sets isDeleted=true, deletedAt=now).
 */
const deleteRecord = async (recordId, requestingUser) => {
  // Use { isDeleted: false } to find non-deleted records
  const record = await FinancialRecord.findOne({ _id: recordId, isDeleted: false });
  if (!record) throw new AppError('Financial record not found.', 404);

  if (requestingUser.role !== 'admin' && record.user.toString() !== requestingUser._id.toString()) {
    throw new AppError('You do not have permission to delete this record.', 403);
  }

  record.isDeleted = true;
  record.deletedAt = new Date();
  await record.save();

  return { message: 'Record successfully deleted.', recordId };
};

module.exports = { createRecord, getRecords, getRecordById, updateRecord, deleteRecord };
