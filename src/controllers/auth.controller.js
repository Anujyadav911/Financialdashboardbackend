const authService = require('../services/auth.service');
const { sendTokenResponse } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const { body } = require('express-validator');

/**
 * POST /api/v1/auth/register
 * Public — but only admins can create admin accounts.
 */
const register = async (req, res, next) => {
  try {
    const requestingUserRole = req.user?.role; // undefined if not logged in
    const user = await authService.register(req.body, requestingUserRole);
    sendTokenResponse(user, 201, res, 'Account created successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/login
 * Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email, password);
    sendTokenResponse(user, 200, res, 'Logged in successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/auth/me
 * Protected — returns the current user's profile.
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: { user: req.user.toPublicJSON ? req.user.toPublicJSON() : req.user },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/logout
 * Protected — clears the cookie.
 */
const logout = async (req, res, next) => {
  try {
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/auth/change-password
 * Protected — allows the current user to change their password.
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return next(new AppError('Both currentPassword and newPassword are required.', 400));
    }
    if (newPassword.length < 6) {
      return next(new AppError('New password must be at least 6 characters.', 400));
    }
    const user = await authService.changePassword(req.user._id, currentPassword, newPassword);
    sendTokenResponse(user, 200, res, 'Password changed successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, logout, changePassword };
