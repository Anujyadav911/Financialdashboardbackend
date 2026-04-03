const userService = require('../services/user.service');

/**
 * GET /api/v1/users
 * Admin only — list all users with pagination.
 */
const getAllUsers = async (req, res, next) => {
  try {
    const result = await userService.getAllUsers(req.query);
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/users/:id
 * Admin or self — retrieve a single user.
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/users/:id
 * Admin or self — update user fields.
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: { user: user.toPublicJSON ? user.toPublicJSON() : user },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/users/:id/deactivate
 * Admin only — deactivate a user account.
 */
const deactivateUser = async (req, res, next) => {
  try {
    const user = await userService.deactivateUser(req.params.id, req.user._id.toString());
    res.status(200).json({
      success: true,
      message: `User "${user.name}" has been deactivated.`,
      data: { user: user.toPublicJSON ? user.toPublicJSON() : user },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/users/:id/activate
 * Admin only — reactivate a user account.
 */
const activateUser = async (req, res, next) => {
  try {
    const user = await userService.activateUser(req.params.id);
    res.status(200).json({
      success: true,
      message: `User "${user.name}" has been activated.`,
      data: { user: user.toPublicJSON ? user.toPublicJSON() : user },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deactivateUser, activateUser };
