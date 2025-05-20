// backend/routes/platform.routes.js
const express = require('express');
const router = express.Router();
const { Platform, PlatformCategory } = require('../models/platform.model');
const { Credential } = require('../models/credential.model');
const { authenticate, isAdmin, isManagerOrAdmin, logActivity } = require('../middleware/auth.middleware');
const { check } = require('express-validator');
const validators = require('../middleware/validators');

/**
 * Platform routes
 * Handles CRUD operations for platforms and platform categories
 */

// Get all platforms
router.get('/', authenticate, async (req, res) => {
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
});

// Get platform by ID
router.get('/:id', authenticate, async (req, res) => {
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
});

// Create platform (admin/manager only)
router.post(
  '/',
  [
    authenticate,
    isManagerOrAdmin,
    check('name', 'Platform name is required').notEmpty(),
    validators.validate
  ],
  async (req, res) => {
    try {
      const { name, category_id, website, description, logo_url } = req.body;

      // Check if platform already exists
      const existingPlatform = await Platform.findOne({ where: { name } });
      if (existingPlatform) {
        return res.status(400).json({
          status: 'error',
          message: 'Platform with this name already exists'
        });
      }

      const platform = await Platform.create({
        name,
        category_id,
        website,
        description,
        logo_url
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
  }
);

// Update platform (admin/manager only)
router.put(
  '/:id',
  [
    authenticate,
    isManagerOrAdmin,
    check('name', 'Platform name is required').optional().notEmpty(),
    validators.validate
  ],
  async (req, res) => {
    try {
      const { name, category_id, website, description, logo_url } = req.body;
      const platformId = req.params.id;

      const platform = await Platform.findByPk(platformId);
      if (!platform) {
        return res.status(404).json({
          status: 'error',
          message: 'Platform not found'
        });
      }

      // Check if updated name already exists for another platform
      if (name && name !== platform.name) {
        const existingPlatform = await Platform.findOne({ where: { name } });
        if (existingPlatform && existingPlatform.id !== parseInt(platformId)) {
          return res.status(400).json({
            status: 'error',
            message: 'Platform with this name already exists'
          });
        }
      }

      // Update platform fields
      if (name) platform.name = name;
      if (category_id !== undefined) platform.category_id = category_id;
      if (website !== undefined) platform.website = website;
      if (description !== undefined) platform.description = description;
      if (logo_url !== undefined) platform.logo_url = logo_url;

      await platform.save();

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
  }
);

// Delete platform (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const platformId = req.params.id;

    const platform = await Platform.findByPk(platformId);
    if (!platform) {
      return res.status(404).json({
        status: 'error',
        message: 'Platform not found'
      });
    }

    // Check if platform is being used by any credentials
    const credentialCount = await Credential.count({ where: { platform_id: platformId } });
    if (credentialCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot delete platform as it is used by ${credentialCount} credentials`
      });
    }

    await platform.destroy();

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
});

// PLATFORM CATEGORIES

// Get all platform categories
router.get('/categories/all', authenticate, async (req, res) => {
  try {
    const categories = await PlatformCategory.findAll({
      order: [['name', 'ASC']]
    });

    return res.status(200).json({
      status: 'success',
      data: categories
    });
  } catch (error) {
    console.error('Get platform categories error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get platform categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create platform category (admin/manager only)
router.post(
  '/categories',
  [
    authenticate,
    isManagerOrAdmin,
    check('name', 'Category name is required').notEmpty(),
    validators.validate
  ],
  async (req, res) => {
    try {
      const { name, description } = req.body;

      // Check if category already exists
      const existingCategory = await PlatformCategory.findOne({ where: { name } });
      if (existingCategory) {
        return res.status(400).json({
          status: 'error',
          message: 'Category with this name already exists'
        });
      }

      const category = await PlatformCategory.create({
        name,
        description
      });

      return res.status(201).json({
        status: 'success',
        message: 'Platform category created successfully',
        data: category
      });
    } catch (error) {
      console.error('Create platform category error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create platform category',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Update platform category (admin/manager only)
router.put(
  '/categories/:id',
  [
    authenticate,
    isManagerOrAdmin,
    check('name', 'Category name is required').optional().notEmpty(),
    validators.validate
  ],
  async (req, res) => {
    try {
      const { name, description } = req.body;
      const categoryId = req.params.id;

      const category = await PlatformCategory.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({
          status: 'error',
          message: 'Platform category not found'
        });
      }

      // Check if updated name already exists for another category
      if (name && name !== category.name) {
        const existingCategory = await PlatformCategory.findOne({ where: { name } });
        if (existingCategory && existingCategory.id !== parseInt(categoryId)) {
          return res.status(400).json({
            status: 'error',
            message: 'Category with this name already exists'
          });
        }
      }

      // Update category fields
      if (name) category.name = name;
      if (description !== undefined) category.description = description;

      await category.save();

      return res.status(200).json({
        status: 'success',
        message: 'Platform category updated successfully',
        data: category
      });
    } catch (error) {
      console.error('Update platform category error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to update platform category',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Delete platform category (admin only)
router.delete('/categories/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await PlatformCategory.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Platform category not found'
      });
    }

    // Check if category is being used by any platforms
    const platformCount = await Platform.count({ where: { category_id: categoryId } });
    if (platformCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot delete category as it is used by ${platformCount} platforms`
      });
    }

    await category.destroy();

    return res.status(200).json({
      status: 'success',
      message: 'Platform category deleted successfully'
    });
  } catch (error) {
    console.error('Delete platform category error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete platform category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;