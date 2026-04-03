const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const { sendTokenResponse } = require('../utils/jwt');

/**
 * Register a new user.
 * Only admins may assign the 'admin' role; otherwise, 'viewer' is default.
 */
const register = async (userData, requestingUserRole) => {
  const { name, email, password, role } = userData;

  // Prevent non-admins from self-assigning the admin role
  if (role === 'admin' && requestingUserRole !== 'admin') {
    throw new AppError('Only admins can create accounts with the admin role.', 403);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('An account with this email address already exists.', 409);
  }

  const user = await User.create({ name, email, password, role: role || 'viewer' });
  return user;
};

/**
 * Authenticate a user with email and password.
 * Returns the user document on success.
 */
const login = async (email, password) => {
  // Explicitly select password (excluded by default)
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact an administrator.', 403);
  }

  // Update last login timestamp
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  return user;
};

/**
 * Change a user's own password.
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('User not found.', 404);

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect.', 401);
  }

  user.password = newPassword;
  await user.save();

  return user;
};

module.exports = { register, login, changePassword };
