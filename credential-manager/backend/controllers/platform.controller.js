// backend/controllers/platform.controller.js
const { Platform, PlatformCategory } = require('../models/platform.model');
const { ActivityLog } = require('../models/activity.model');
const { Op } = require('sequelize');

/**
 * Platform Controller
 * Handles platform and platform category operations
 */
const platformController = {
  /**
   * Get all platforms
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllPlatforms: async (req, res) => {
    try {
      const platforms = await Platform.findAll({
        include: [{ model: PlatformCategory, as: 'category' }],
        order: [['name', 'ASC']]
      });

      return res.status(200).json({
        status: 'success',
        data: platforms
      });
    } catch (error) {
      console.error('Get platforms error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get platforms',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Get platform by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getPlatformById: async (req, res) => {
    try {
      const platform = await Platform.findByPk(req.params.id, {
        include: [{ model: PlatformCategory, as: 'category' }]
      });

      if (!platform) {
        return res.status(404).json({
          status: 'error',
          message: 'Platform not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: platform
      });
    } catch (error) {
      console.error('Get platform error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get platform',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Create a new platform
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createPlatform: async (req, res) => {
    try {
      const { name, category_id, website, description, logo_url } = req.body;

      // Check if platform already exists
      const existingPlatform = await Platform.findOne({
        where: { name }
      });

      if (existingPlatform) {
        return res.status(400).json({
          status: 'error',
          message: 'Platform with this name already exists'
        });
      }

      // Create platform
      const platform = await Platform.create({
        name,
        category_id,
        website,
        description,
        logo_url
      });

      // Log activity
      await ActivityLog.create({
        user_id: req.user.id,
        action_type: 'create',
        entity_type: 'platform',
        entity_id: platform.id,
        description: `Platform ${platform.name} was created`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(201).json({
        status: 'success',
        message: 'Platform created successfully',
        data: platform
      });
    } catch (error) {
      console.error('Create platform error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create platform',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Update a platform
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updatePlatform: async (req, res) => {
    try {
      const { name, category_id, website, description, logo_url } = req.body;
      const platformId = req.params.id;

      // Check if platform exists
      const platform = await Platform.findByPk(platformId);

      if (!platform) {
        return res.status(404).json({
          status: 'error',
          message: 'Platform not found'
        });
      }

      // Check if name is being changed and if it already exists
      if (name && name !== platform.name) {
        const existingPlatform = await Platform.findOne({
          where: { name }
        });

        if (existingPlatform) {
          return res.status(400).json({
            status: 'error',
            message: 'Platform with this name already exists'
          });
        }
      }

      // Update platform
      await platform.update({
        name: name || platform.name,
        category_id: category_id !== undefined ? category_id : platform.category_id,
        website: website !== undefined ? website : platform.website,
        description: description !== undefined ? description : platform.description,
        logo_url: logo_url !== undefined ? logo_url : platform.logo_url
      });

      // Log activity
      await ActivityLog.create({
        user_id: req.user.id,
        action_type: 'update',
        entity_type: 'platform',
        entity_id: platform.id,
        description: `Platform ${platform.name} was updated`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(200).json({
        status: 'success',
        message: 'Platform updated successfully',
        data: platform
      });
    } catch (error) {
      console.error('Update platform error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to update platform',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Delete a platform
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deletePlatform: async (req, res) => {
    try {
      const platformId = req.params.id;

      // Check if platform exists
      const platform = await Platform.findByPk(platformId);

      if (!platform) {
        return res.status(404).json({
          status: 'error',
          message: 'Platform not found'
        });
      }

      // Delete platform
      await platform.destroy();

      // Log activity
      await ActivityLog.create({
        user_id: req.user.id,
        action_type: 'delete',
        entity_type: 'platform',
        entity_id: platformId,
        description: `Platform ${platform.name} was deleted`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(200).json({
        status: 'success',
        message: 'Platform deleted successfully'
      });
    } catch (error) {
      console.error('Delete platform error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to delete platform',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Get all platform categories
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllCategories: async (req, res) => {
    try {
      const categories = await PlatformCategory.findAll({
        order: [['name', 'ASC']]
      });

      return res.status(200).json({
        status: 'success',
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get platform categories',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Get category by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getCategoryById: async (req, res) => {
    try {
      const category = await PlatformCategory.findByPk(req.params.id);

      if (!category) {
        return res.status(404).json({
          status: 'error',
          message: 'Category not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: category
      });
    } catch (error) {
      console.error('Get category error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get category',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Create a new platform category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createCategory: async (req, res) => {
    try {
      const { name, description } = req.body;

      // Check if category already exists
      const existingCategory = await PlatformCategory.findOne({
        where: { name }
      });

      if (existingCategory) {
        return res.status(400).json({
          status: 'error',
          message: 'Category with this name already exists'
        });
      }

      // Create category
      const category = await PlatformCategory.create({
        name,
        description
      });

      // Log activity
      await ActivityLog.create({
        user_id: req.user.id,
        action_type: 'create',
        entity_type: 'platform_category',
        entity_id: category.id,
        description: `Platform category ${category.name} was created`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(201).json({
        status: 'success',
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      console.error('Create category error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create category',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Update a platform category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateCategory: async (req, res) => {
    try {
      const { name, description } = req.body;
      const categoryId = req.params.id;

      // Check if category exists
      const category = await PlatformCategory.findByPk(categoryId);

      if (!category) {
        return res.status(404).json({
          status: 'error',
          message: 'Category not found'
        });
      }

      // Check if name is being changed and if it already exists
      if (name && name !== category.name) {
        const existingCategory = await PlatformCategory.findOne({
          where: { name }
        });

        if (existingCategory) {
          return res.status(400).json({
            status: 'error',
            message: 'Category with this name already exists'
          });
        }
      }

      // Update category
      await category.update({
        name: name || category.name,
        description: description !== undefined ? description : category.description
      });

      // Log activity
      await ActivityLog.create({
        user_id: req.user.id,
        action_type: 'update',
        entity_type: 'platform_category',
        entity_id: category.id,
        description: `Platform category ${category.name} was updated`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(200).json({
        status: 'success',
        message: 'Category updated successfully',
        data: category
      });
    } catch (error) {
      console.error('Update category error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to update category',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Delete a platform category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteCategory: async (req, res) => {
    try {
      const categoryId = req.params.id;

      // Check if category exists
      const category = await PlatformCategory.findByPk(categoryId);

      if (!category) {
        return res.status(404).json({
          status: 'error',
          message: 'Category not found'
        });
      }

      // Check if category is being used by any platforms
      const platformsUsingCategory = await Platform.count({
        where: { category_id: categoryId }
      });

      if (platformsUsingCategory > 0) {
        return res.status(400).json({
          status: 'error',
          message: `Cannot delete category. It is being used by ${platformsUsingCategory} platform(s).`
        });
      }

      // Delete category
      await category.destroy();

      // Log activity
      await ActivityLog.create({
        user_id: req.user.id,
        action_type: 'delete',
        entity_type: 'platform_category',
        entity_id: categoryId,
        description: `Platform category ${category.name} was deleted`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(200).json({
        status: 'success',
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Delete category error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to delete category',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = platformController;