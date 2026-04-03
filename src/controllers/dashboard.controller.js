const dashboardService = require('../services/dashboard.service');

/**
 * GET /api/v1/dashboard/summary
 * All roles — total income, total expenses, net balance.
 */
const getSummary = async (req, res, next) => {
  try {
    const data = await dashboardService.getSummary(req.user, req.query);
    res.status(200).json({
      success: true,
      message: 'Dashboard summary retrieved successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/dashboard/categories
 * Analyst and Admin — category-wise totals.
 */
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const data = await dashboardService.getCategoryBreakdown(req.user, req.query);
    res.status(200).json({
      success: true,
      message: 'Category breakdown retrieved successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/dashboard/trends/monthly
 * Analyst and Admin — monthly income vs expense trends.
 */
const getMonthlyTrends = async (req, res, next) => {
  try {
    const data = await dashboardService.getMonthlyTrends(req.user, req.query);
    res.status(200).json({
      success: true,
      message: 'Monthly trends retrieved successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/dashboard/trends/weekly
 * Analyst and Admin — weekly trends for the current month.
 */
const getWeeklyTrends = async (req, res, next) => {
  try {
    const data = await dashboardService.getWeeklyTrends(req.user, req.query);
    res.status(200).json({
      success: true,
      message: 'Weekly trends retrieved successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/dashboard/recent
 * All roles — returns the latest transactions.
 */
const getRecentActivity = async (req, res, next) => {
  try {
    const limit = req.query.limit || 10;
    const data = await dashboardService.getRecentActivity(req.user, limit);
    res.status(200).json({
      success: true,
      message: 'Recent activity retrieved successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, getCategoryBreakdown, getMonthlyTrends, getWeeklyTrends, getRecentActivity };
