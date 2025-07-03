// backend/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const User = require('../models/user.model');
const { ActivityLog } = require('../models/activity.model');
const authConfig = require('../config/auth.config');

/**
 * Authentication Controller
 * Handles user authentication, registration, and token management
 */
const authController = {
  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  register: async (req, res) => {
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
        role: req.user && req.user.role === 'admin' ? role : 'user' // Only admins can set roles
      });

      // Log activity
      await ActivityLog.create({
        user_id: req.user ? req.user.id : newUser.id,
        action_type: 'create',
        entity_type: 'user',
        entity_id: newUser.id,
        description: `User ${newUser.username} was created`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
          user: newUser.toJSON()
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to register user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Login a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Find user by username
      const user = await User.findOne({
        where: { username }
      });

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid username or password'
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(403).json({
          status: 'error',
          message: 'Account is deactivated'
        });
      }

      // Validate password
      const isPasswordValid = await user.validatePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid username or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, role: user.role },
        authConfig.secret,
        { expiresIn: authConfig.jwtExpiration }
      );

      // Update last login
      await user.update({ last_login: new Date() });

      // Log activity
      await ActivityLog.create({
        user_id: user.id,
        action_type: 'login',
        entity_type: 'user',
        entity_id: user.id,
        description: `User ${user.username} logged in`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          token,
          expiresIn: authConfig.jwtExpiration
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to login',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Get current user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getProfile: async (req, res) => {
    try {
      return res.status(200).json({
        status: 'success',
        data: {
          user: req.user.toJSON()
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get user profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Update user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateProfile: async (req, res) => {
    try {
      const { first_name, last_name, email, password } = req.body;
      const userId = req.user.id;

      // Get user
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Update user fields
      if (first_name) user.first_name = first_name;
      if (last_name) user.last_name = last_name;
      if (email) user.email = email;
      if (password) user.password = password; // Will be hashed by model hook

      await user.save();

      // Log activity
      await ActivityLog.create({
        user_id: userId,
        action_type: 'update',
        entity_type: 'user',
        entity_id: userId,
        description: `User ${user.username} updated their profile`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: {
          user: user.toJSON()
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
  },

  /**
   * Logout user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  logout: async (req, res) => {
    try {
      // Log activity
      await ActivityLog.create({
        user_id: req.user.id,
        action_type: 'logout',
        entity_type: 'user',
        entity_id: req.user.id,
        description: `User ${req.user.username} logged out`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(200).json({
        status: 'success',
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to logout',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = authController;