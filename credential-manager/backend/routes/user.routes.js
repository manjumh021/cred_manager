// backend/routes/user.routes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { ActivityLog } = require('../models/activity.model');
const { authenticate, isAdmin, logActivity } = require('../middleware/auth.middleware');
const { check } = require('express-validator');
const validators = require('../middleware/validators');

/**
 * User routes
 * Handles user management operations (admin only)
 */

// Get all users (admin only)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['username', 'ASC']]
    });

    return res.status(200).json({
      status: 'success',
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user by ID (admin only)
router.get('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user (admin only)
router.put(
  '/:id',
  [
    authenticate,
    isAdmin,
    check('email', 'Please include a valid email').optional().isEmail(),
    check('role', 'Role must be admin, manager, or user').optional().isIn(['admin', 'manager', 'user']),
    validators.validate
  ],
  async (req, res) => {
    try {
      const { first_name, last_name, email, role, is_active } = req.body;
      const userId = req.params.id;

      // Prevent updating own role or active status
      if (parseInt(userId) === req.user.id && (role || is_active !== undefined)) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot update your own role or active status'
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Update user fields
      if (first_name !== undefined) user.first_name = first_name;
      if (last_name !== undefined) user.last_name = last_name;
      if (email) user.email = email;
      if (role) user.role = role;
      if (is_active !== undefined) user.is_active = is_active;

      await user.save();

      // Log activity
      await ActivityLog.create({
        user_id: req.user.id,
        action_type: 'update',
        entity_type: 'user',
        entity_id: userId,
        description: `User ${user.username} was updated`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        data: user.toJSON()
      });
    } catch (error) {
      console.error('Update user error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to update user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Reset user password (admin only)
router.post(
  '/:id/reset-password',
  [
    authenticate,
    isAdmin,
    check('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
    validators.validate
  ],
  async (req, res) => {
    try {
      const { password } = req.body;
      const userId = req.params.id;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Update password
      user.password = password; // Will be hashed by model hook
      await user.save();

      // Log activity
      await ActivityLog.create({
        user_id: req.user.id,
        action_type: 'update',
        entity_type: 'user',
        entity_id: userId,
        description: `Password reset for user ${user.username}`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(200).json({
        status: 'success',
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to reset password',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Delete (deactivate) user (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent deleting own account
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Soft delete by setting is_active to false
    user.is_active = false;
    await user.save();

    // Log activity
    await ActivityLog.create({
      user_id: req.user.id,
      action_type: 'delete',
      entity_type: 'user',
      entity_id: userId,
      description: `User ${user.username} was deactivated`,
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });

    return res.status(200).json({
      status: 'success',
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;