const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate');
const { registerValidator, loginValidator } = require('../validators');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public (admin role assignment requires authentication)
 */
router.post('/register', registerValidator, validate, authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login and receive JWT
 * @access  Public
 */
router.post('/login', loginValidator, validate, authController.login);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get currently authenticated user
 * @access  Protected
 */
router.get('/me', protect, authController.getMe);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout and clear cookie
 * @access  Protected
 */
router.post('/logout', protect, authController.logout);

/**
 * @route   PATCH /api/v1/auth/change-password
 * @desc    Change the current user's password
 * @access  Protected
 */
router.patch('/change-password', protect, authController.changePassword);

module.exports = router;
