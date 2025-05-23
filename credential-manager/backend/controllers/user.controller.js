// backend/controllers/user.controller.js
const User = require('../models/user.model');
const { ActivityLog } = require('../models/activity.model');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const authConfig = require('../config/auth.config');

/**
 * User Controller
 * Handles user management operations (admin only)
 */
const userController = {
  /**
   * Get all users
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllUsers: async (req, res) => {
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
  },

  /**
   * Get user by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getUserById: async (req, res) => {
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
  },

  /**
   * Create a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createUser: async (req, res) => {
    try {
      const { username, email, password, first_name, last_name, role } = req.body;

      // Check if username or email already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { username },
            { email }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Username or email already exists'
        });
      }

      // Create new user
      const newUser = await User.create({
        username,
        email,
        password, // Will be hashed by the model hook
        first_name,
        last_name,
        role
      });

      // Log activity
      await ActivityLog.create({
        user_id: req.user.id,
        action_type: 'create',
        entity_type: 'user',
        entity_id: newUser.id,
        description: `User ${newUser.username} was created`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        data: {
          ...newUser.toJSON(),
          password: undefined
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Update a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateUser: async (req, res) => {
    try {
      const { username, email, password, first_name, last_name, role, is_active } = req.body;
      const userId = req.params.id;

      // Check if user exists
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Check if username or email is being changed and if it already exists
      if ((username && username !== user.username) || (email && email !== user.email)) {
        const existingUser = await User.findOne({
          where: {
            [Op.or]: [
              { username: username || '' },
              { email: email || '' }
            ],
            id: { [Op.ne]: userId }
          }
        });

        if (existingUser) {
          return res.status(400).json({
            status: 'error',
            message: 'Username or email already exists'
          });
        }
      }

      // Prepare update data
      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (password) updateData.password = password; // Will be hashed by the model hook
      if (first_name !== undefined) updateData.first_name = first_name;
      if (last_name !== undefined) updateData.last_name = last_name;
      if (role) updateData.role = role;
      if (is_active !== undefined) updateData.is_active = is_active;

      // Update user
      await user.update(updateData);

      // Log activity
      await ActivityLog.create({
        user_id: req.user.id,
        action_type: 'update',
        entity_type: 'user',
        entity_id: user.id,
        description: `User ${user.username} was updated`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        data: {
          ...user.toJSON(),
          password: undefined
        }
      });
    } catch (error) {
      console.error('Update user error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to update user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Delete a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteUser: async (req, res) => {
    try {
      const userId = req.params.id;

      // Prevent deleting yourself
      if (userId == req.user.id) {
        return res.status(400).json({
          status: 'error',
          message: 'You cannot delete your own account'
        });
      }

      // Check if user exists
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Delete user
      await user.destroy();

      // Log activity
      await ActivityLog.create({
        user_id: req.user.id,
        action_type: 'delete',
        entity_type: 'user',
        entity_id: userId,
        description: `User ${user.username} was deleted`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(200).json({
        status: 'success',
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to delete user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Change user password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  changePassword: async (req, res) => {
    try {
      const { current_password, new_password } = req.body;
      const userId = req.params.id;

      // Check if user exists
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // If changing own password, verify current password
      if (userId == req.user.id) {
        const isPasswordValid = await bcrypt.compare(current_password, user.password);
        
        if (!isPasswordValid) {
          return res.status(401).json({
            status: 'error',
            message: 'Current password is incorrect'
          });
        }
      }

      // Update password
      await user.update({
        password: new_password // Will be hashed by the model hook
      });

      // Log activity
      await ActivityLog.create({
        user_id: req.user.id,
        action_type: 'update',
        entity_type: 'user',
        entity_id: user.id,
        description: `Password was changed for user ${user.username}`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(200).json({
        status: 'success',
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to change password',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Get user profile (own profile)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getProfile: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
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
      console.error('Get profile error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Update user profile (own profile)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateProfile: async (req, res) => {
    try {
      const { first_name, last_name, email } = req.body;
      const userId = req.user.id;

      // Check if user exists
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Check if email is being changed and if it already exists
      if (email && email !== user.email) {
        const existingUser = await User.findOne({
          where: {
            email,
            id: { [Op.ne]: userId }
          }
        });

        if (existingUser) {
          return res.status(400).json({
            status: 'error',
            message: 'Email already exists'
          });
        }
      }

      // Update user
      await user.update({
        first_name: first_name !== undefined ? first_name : user.first_name,
        last_name: last_name !== undefined ? last_name : user.last_name,
        email: email || user.email
      });

      // Log activity
      await ActivityLog.create({
        user_id: req.user.id,
        action_type: 'update',
        entity_type: 'user',
        entity_id: user.id,
        description: `User ${user.username} updated their profile`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: {
          ...user.toJSON(),
          password: undefined
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to update profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = userController;