const User = require('../models/user.model');
const AppError = require('../utils/AppError');

/**
 * Retrieve all users with optional filters.
 * Supports: role, isActive, pagination
 */
const getAllUsers = async (query) => {
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, parseInt(query.limit) || 20);
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter).select('-password -__v').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Retrieve a single user by ID.
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password -__v');
  if (!user) throw new AppError('User not found.', 404);
  return user;
};

/**
 * Update user fields. Admins can update any user; users can update their own profile.
 * Sensitive fields (role, isActive) restricted to admins.
 */
const updateUser = async (targetUserId, updateData, requestingUser) => {
  const user = await User.findById(targetUserId);
  if (!user) throw new AppError('User not found.', 404);

  const { name, email, role, isActive } = updateData;

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;

  // Only admins can change role or activation status
  if (requestingUser.role === 'admin') {
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
  } else {
    if (role !== undefined || isActive !== undefined) {
      throw new AppError('Only admins can modify roles or account status.', 403);
    }
  }

  await user.save();
  return user;
};

/**
 * Soft-deactivate a user (admin only). Does not delete the document.
 */
const deactivateUser = async (targetUserId, requestingUserId) => {
  if (targetUserId === requestingUserId) {
    throw new AppError('You cannot deactivate your own account.', 400);
  }

  const user = await User.findById(targetUserId);
  if (!user) throw new AppError('User not found.', 404);

  user.isActive = false;
  await user.save({ validateBeforeSave: false });
  return user;
};

/**
 * Reactivate a previously deactivated user (admin only).
 */
const activateUser = async (targetUserId) => {
  const user = await User.findById(targetUserId);
  if (!user) throw new AppError('User not found.', 404);

  user.isActive = true;
  await user.save({ validateBeforeSave: false });
  return user;
};

module.exports = { getAllUsers, getUserById, updateUser, deactivateUser, activateUser };
