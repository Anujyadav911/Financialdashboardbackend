const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');

/**
 * protect — Verifies JWT and attaches user to req.user
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header or cookie
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers.cookie) {
      // Manually parse cookies since cookie-parser is not installed
      const match = req.headers.cookie.match(/(?:^|;)\s*jwt=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    if (!token) {
      return next(new AppError('Authentication required. Please log in to access this resource.', 401));
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Your session has expired. Please log in again.', 401));
      }
      return next(new AppError('Invalid token. Please log in again.', 401));
    }

    // 3. Check if user still exists and is active
    const user = await User.findById(decoded.id).select('+isActive +role');
    if (!user) {
      return next(new AppError('The user associated with this token no longer exists.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated. Please contact an administrator.', 403));
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * authorize — Role-based access control middleware factory
 * Usage: authorize('admin', 'analyst')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Your role (${req.user.role}) does not have permission to perform this action.`,
          403
        )
      );
    }
    next();
  };
};

/**
 * ownerOrAdmin — Allows the resource owner or an admin to proceed
 * Expects req.params.id to be the target user's ID
 */
const ownerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }

  const targetId = req.params.id || req.params.userId;
  const isSelf = req.user._id.toString() === targetId;
  const isAdmin = req.user.role === 'admin';

  if (!isSelf && !isAdmin) {
    return next(new AppError('You can only access your own resources, or must be an admin.', 403));
  }
  next();
};

module.exports = { protect, authorize, ownerOrAdmin };
