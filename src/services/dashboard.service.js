const FinancialRecord = require('../models/record.model');

/**
 * Builds a match stage for the aggregation pipeline.
 * Scopes by user unless the requesting user is an admin.
 */
const buildMatchStage = (requestingUser, query = {}) => {
  const match = { isDeleted: false };

  // Admins can view all or filter by a specific userId
  if (requestingUser.role !== 'admin') {
    match.user = requestingUser._id;
  } else if (query.userId) {
    const mongoose = require('mongoose');
    match.user = new mongoose.Types.ObjectId(query.userId);
  }

  if (query.startDate || query.endDate) {
    match.date = {};
    if (query.startDate) match.date.$gte = new Date(query.startDate);
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      match.date.$lte = end;
    }
  }

  return match;
};

/**
 * Summary: total income, total expenses, net balance, and transaction count.
 */
const getSummary = async (requestingUser, query) => {
  const match = buildMatchStage(requestingUser, query);

  const result = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
        },
        totalExpenses: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
        },
        totalTransactions: { $sum: 1 },
        incomeCount: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, 1, 0] },
        },
        expenseCount: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalIncome: { $round: ['$totalIncome', 2] },
        totalExpenses: { $round: ['$totalExpenses', 2] },
        netBalance: { $round: [{ $subtract: ['$totalIncome', '$totalExpenses'] }, 2] },
        totalTransactions: 1,
        incomeCount: 1,
        expenseCount: 1,
      },
    },
  ]);

  return result[0] || {
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    totalTransactions: 0,
    incomeCount: 0,
    expenseCount: 0,
  };
};

/**
 * Category-wise totals breakdown split by income and expense.
 */
const getCategoryBreakdown = async (requestingUser, query) => {
  const match = buildMatchStage(requestingUser, query);

  const result = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
    {
      $group: {
        _id: '$_id.category',
        breakdown: {
          $push: {
            type: '$_id.type',
            total: { $round: ['$total', 2] },
            count: '$count',
          },
        },
        categoryTotal: { $sum: '$total' },
      },
    },
    { $sort: { categoryTotal: -1 } },
    {
      $project: {
        category: '$_id',
        _id: 0,
        breakdown: 1,
        categoryTotal: { $round: ['$categoryTotal', 2] },
      },
    },
  ]);

  return result;
};

/**
 * Monthly trends: income vs expense grouped by year-month.
 */
const getMonthlyTrends = async (requestingUser, query) => {
  const match = buildMatchStage(requestingUser, query);

  // Default to last 12 months if no date range provided
  if (!match.date) {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);
    match.date = { $gte: twelveMonthsAgo };
  }

  const result = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $group: {
        _id: { year: '$_id.year', month: '$_id.month' },
        entries: {
          $push: {
            type: '$_id.type',
            total: { $round: ['$total', 2] },
            count: '$count',
          },
        },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        label: {
          $concat: [
            { $toString: '$_id.year' },
            '-',
            {
              $cond: [
                { $lt: ['$_id.month', 10] },
                { $concat: ['0', { $toString: '$_id.month' }] },
                { $toString: '$_id.month' },
              ],
            },
          ],
        },
        entries: 1,
      },
    },
  ]);

  return result;
};

/**
 * Weekly trends for the current month.
 */
const getWeeklyTrends = async (requestingUser, query) => {
  const match = buildMatchStage(requestingUser, query);

  // Default to current month
  if (!match.date) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    match.date = { $gte: startOfMonth };
  }

  const result = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          week: { $week: '$date' },
          year: { $year: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
  ]);

  return result;
};

/**
 * Recent activity: latest N transactions.
 */
const getRecentActivity = async (requestingUser, limit = 10) => {
  const match = buildMatchStage(requestingUser, {});

  const records = await FinancialRecord.find(match)
    .populate('user', 'name email')
    .sort({ date: -1 })
    .limit(Math.min(parseInt(limit), 50));

  return records;
};

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
};
