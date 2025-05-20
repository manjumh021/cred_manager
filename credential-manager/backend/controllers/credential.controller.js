// backend/controllers/credential.controller.js
const { Credential, CredentialField } = require('../models/credential.model');
const { ActivityLog } = require('../models/activity.model');
const { Op } = require('sequelize');

/**
 * Credential Controller
 * Handles CRUD operations for credentials
 */
const credentialController = {
  // Create a new credential with optional additional fields
  createCredential: async (req, res) => {
    try {
      const {
        client_id,
        platform_id,
        account_name,
        username,
        password,
        url,
        notes,
        expiry_date,
        additionalFields = []
      } = req.body;
      const created_by = req.user.id;

      const newCredential = await Credential.create({
        client_id,
        platform_id,
        account_name,
        username,
        password,
        url,
        notes,
        expiry_date,
        created_by
      });

      // Create additional fields if provided
      if (additionalFields.length > 0) {
        for (const field of additionalFields) {
          await CredentialField.create({
            credential_id: newCredential.id,
            field_name: field.field_name,
            field_value: field.field_value
          });
        }
      }

      await ActivityLog.create({
        user_id: created_by,
        action_type: 'create',
        entity_type: 'credential',
        entity_id: newCredential.id,
        description: `Credential ${account_name} created`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(201).json({
        status: 'success',
        message: 'Credential created successfully',
        data: newCredential
      });
    } catch (error) {
      console.error('Create credential error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create credential',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get all credentials with pagination and optional filters
  getCredentials: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        client_id,
        platform_id,
        search = '',
        is_active
      } = req.query;
      const offset = (page - 1) * limit;

      const whereConditions = {};
      if (client_id) whereConditions.client_id = client_id;
      if (platform_id) whereConditions.platform_id = platform_id;
      if (is_active !== undefined) whereConditions.is_active = is_active === 'true';
      if (search) {
        whereConditions.account_name = { [Op.like]: `%${search}%` };
      }

      const { count, rows } = await Credential.findAndCountAll({
        where: whereConditions,
        include: ['client', 'platform', 'additionalFields'],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['account_name', 'ASC']]
      });

      return res.status(200).json({
        status: 'success',
        data: {
          credentials: rows,
          total: count,
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get credentials error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get credentials',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get a single credential by ID including additional fields
  getCredentialById: async (req, res) => {
    try {
      const credentialId = req.params.id;
      const credential = await Credential.findByPk(credentialId, {
        include: ['client', 'platform', 'additionalFields']
      });

      if (!credential) {
        return res.status(404).json({
          status: 'error',
          message: 'Credential not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: credential
      });
    } catch (error) {
      console.error('Get credential error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get credential',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Update a credential by ID including additional fields
  updateCredential: async (req, res) => {
    try {
      const credentialId = req.params.id;
      const {
        client_id,
        platform_id,
        account_name,
        username,
        password,
        url,
        notes,
        expiry_date,
        is_active,
        additionalFields = []
      } = req.body;

      const credential = await Credential.findByPk(credentialId, {
        include: ['additionalFields']
      });

      if (!credential) {
        return res.status(404).json({
          status: 'error',
          message: 'Credential not found'
        });
      }

      credential.client_id = client_id !== undefined ? client_id : credential.client_id;
      credential.platform_id = platform_id !== undefined ? platform_id : credential.platform_id;
      credential.account_name = account_name !== undefined ? account_name : credential.account_name;
      credential.username = username !== undefined ? username : credential.username;
      credential.password = password !== undefined ? password : credential.password;
      credential.url = url !== undefined ? url : credential.url;
      credential.notes = notes !== undefined ? notes : credential.notes;
      credential.expiry_date = expiry_date !== undefined ? expiry_date : credential.expiry_date;
      if (is_active !== undefined) credential.is_active = is_active;

      await credential.save();

      // Update additional fields: delete existing and recreate
      if (additionalFields.length > 0) {
        await CredentialField.destroy({ where: { credential_id: credentialId } });
        for (const field of additionalFields) {
          await CredentialField.create({
            credential_id: credentialId,
            field_name: field.field_name,
            field_value: field.field_value
          });
        }
      }

      await ActivityLog.create({
        user_id: req.user.id,
        action_type: 'update',
        entity_type: 'credential',
        entity_id: credential.id,
        description: `Credential ${credential.account_name} updated`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(200).json({
        status: 'success',
        message: 'Credential updated successfully',
        data: credential
      });
    } catch (error) {
      console.error('Update credential error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to update credential',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Delete a credential by ID (soft delete by setting is_active to false)
  deleteCredential: async (req, res) => {
    try {
      const credentialId = req.params.id;
      const credential = await Credential.findByPk(credentialId);

      if (!credential) {
        return res.status(404).json({
          status: 'error',
          message: 'Credential not found'
        });
      }

      credential.is_active = false;
      await credential.save();

      await ActivityLog.create({
        user_id: req.user.id,
        action_type: 'delete',
        entity_type: 'credential',
        entity_id: credential.id,
        description: `Credential ${credential.account_name} deactivated`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(200).json({
        status: 'success',
        message: 'Credential deactivated successfully'
      });
    } catch (error) {
      console.error('Delete credential error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to delete credential',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = credentialController;
