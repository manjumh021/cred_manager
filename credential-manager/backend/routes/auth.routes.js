// backend/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const { check } = require('express-validator');
const validators = require('../middleware/validators');

// User registration
router.post(
  '/register',
  [
    check('username', 'Username is required and must be between 3-50 characters').isLength({ min: 3, max: 50 }),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
    validators.validate
  ],
  authController.register
);

// User login
router.post(
  '/login',
  [
    check('username', 'Username is required').notEmpty(),
    check('password', 'Password is required').notEmpty(),
    validators.validate
  ],
  authController.login
);

// Get current user profile
router.get('/profile', verifyToken, authController.getProfile);

// Update user profile
router.put(
  '/profile',
  [
    verifyToken,
    check('email', 'Please include a valid email').optional().isEmail(),
    check('password', 'Password must be at least 8 characters').optional().isLength({ min: 8 }),
    validators.validate
  ],
  authController.updateProfile
);

// User logout
router.post('/logout', verifyToken, authController.logout);

// Admin only: Register new user with role
router.post(
  '/admin/register',
  [
    verifyToken,
    isAdmin,
    check('username', 'Username is required and must be between 3-50 characters').isLength({ min: 3, max: 50 }),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
    check('role', 'Role must be admin, manager, or user').isIn(['admin', 'manager', 'user']),
    validators.validate
  ],
  authController.register
);

module.exports = router;