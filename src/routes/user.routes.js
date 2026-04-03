const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const { protect, authorize, ownerOrAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate');
const { updateUserValidator, mongoIdValidator } = require('../validators');

// All user routes require authentication
router.use(protect);

/**
 * @route   GET /api/v1/users
 * @desc    List all users with optional filters
 * @access  Admin only
 */
router.get('/', authorize('admin'), userController.getAllUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get a single user by ID
 * @access  Admin or self
 */
router.get('/:id', mongoIdValidator('id'), validate, ownerOrAdmin, userController.getUserById);

/**
 * @route   PATCH /api/v1/users/:id
 * @desc    Update a user's profile (admin can also update role/status)
 * @access  Admin or self
 */
router.patch(
  '/:id',
  mongoIdValidator('id'),
  updateUserValidator,
  validate,
  ownerOrAdmin,
  userController.updateUser
);

/**
 * @route   PATCH /api/v1/users/:id/deactivate
 * @desc    Deactivate a user account
 * @access  Admin only
 */
router.patch('/:id/deactivate', mongoIdValidator('id'), validate, authorize('admin'), userController.deactivateUser);

/**
 * @route   PATCH /api/v1/users/:id/activate
 * @desc    Reactivate a user account
 * @access  Admin only
 */
router.patch('/:id/activate', mongoIdValidator('id'), validate, authorize('admin'), userController.activateUser);

module.exports = router;
