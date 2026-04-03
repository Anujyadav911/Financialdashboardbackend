const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT access token for the given user ID.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Sends a token response with cookie and JSON body.
 */
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('jwt', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    data: {
      user: user.toPublicJSON ? user.toPublicJSON() : user,
    },
  });
};

module.exports = { generateToken, sendTokenResponse };
