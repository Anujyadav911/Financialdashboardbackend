const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All dashboard routes require authentication
router.use(protect);

/**
 * @route   GET /api/v1/dashboard/summary
 * @desc    Get total income, total expenses, and net balance
 * @access  All roles
 * @query   startDate, endDate, userId (admin only)
 */
router.get('/summary', dashboardController.getSummary);

/**
 * @route   GET /api/v1/dashboard/categories
 * @desc    Get category-wise income and expense totals
 * @access  Analyst, Admin
 * @query   startDate, endDate, userId (admin only)
 */
router.get('/categories', authorize('analyst', 'admin'), dashboardController.getCategoryBreakdown);

/**
 * @route   GET /api/v1/dashboard/trends/monthly
 * @desc    Get monthly income vs expense trends (default: last 12 months)
 * @access  Analyst, Admin
 * @query   startDate, endDate, userId (admin only)
 */
router.get('/trends/monthly', authorize('analyst', 'admin'), dashboardController.getMonthlyTrends);

/**
 * @route   GET /api/v1/dashboard/trends/weekly
 * @desc    Get weekly trends for the current month
 * @access  Analyst, Admin
 */
router.get('/trends/weekly', authorize('analyst', 'admin'), dashboardController.getWeeklyTrends);

/**
 * @route   GET /api/v1/dashboard/recent
 * @desc    Get the most recent transactions
 * @access  All roles
 * @query   limit (max 50, default 10)
 */
router.get('/recent', dashboardController.getRecentActivity);

module.exports = router;
