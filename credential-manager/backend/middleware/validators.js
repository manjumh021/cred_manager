// backend/middleware/validators.js
const { validationResult } = require('express-validator');

/**
 * Middleware to validate request and return errors if any
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validate
};
