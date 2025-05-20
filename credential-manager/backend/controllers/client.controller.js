// backend/controllers/client.controller.js
import { Client } from '../models/client.model';
import { ActivityLog } from '../models/activity.model';

/**
 * Client Controller
 * Handles CRUD operations for clients
 */
const clientController = {
  // Create a new client
  createClient: async (req, res) => {
    try {
      const { name, contact_person, email, phone, address, notes } = req.body;
      const created_by = req.user.id;

      const newClient = await Client.create({
        name,
        contact_person,
        email,
        phone,
        address,
        notes,
        created_by
      });

      await ActivityLog.create({
        user_id: created_by,
        action_type: 'create',
        entity_type: 'client',
        entity_id: newClient.id,
        description: `Client ${newClient.name} created`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(201).json({
        status: 'success',
        message: 'Client created successfully',
        data: newClient
      });
    } catch (error) {
      console.error('Create client error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create client',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get all clients with pagination and optional filters
  getClients: async (req, res) => {
    try {
      const { page = 1, limit = 20, search = '', is_active } = req.query;
      const offset = (page - 1) * limit;

      const whereConditions = {};
      if (search) {
        whereConditions.name = { $like: `%${search}%` };
      }
      if (is_active !== undefined) {
        whereConditions.is_active = is_active === 'true';
      }

      const { count, rows } = await Client.findAndCountAll({
        where: whereConditions,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['name', 'ASC']]
      });

      return res.status(200).json({
        status: 'success',
        data: {
          clients: rows,
          total: count,
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get clients error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get clients',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get a single client by ID
  getClientById: async (req, res) => {
    try {
      const clientId = req.params.id;
      const client = await Client.findByPk(clientId);

      if (!client) {
        return res.status(404).json({
          status: 'error',
          message: 'Client not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: client
      });
    } catch (error) {
      console.error('Get client error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get client',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Update a client by ID
  updateClient: async (req, res) => {
    try {
      const clientId = req.params.id;
      const { name, contact_person, email, phone, address, notes, is_active } = req.body;

      const client = await Client.findByPk(clientId);
      if (!client) {
        return res.status(404).json({
          status: 'error',
          message: 'Client not found'
        });
      }

      client.name = name !== undefined ? name : client.name;
      client.contact_person = contact_person !== undefined ? contact_person : client.contact_person;
      client.email = email !== undefined ? email : client.email;
      client.phone = phone !== undefined ? phone : client.phone;
      client.address = address !== undefined ? address : client.address;
      client.notes = notes !== undefined ? notes : client.notes;
      if (is_active !== undefined) client.is_active = is_active;

      await client.save();

      await ActivityLog.create({
        user_id: req.user.id,
        action_type: 'update',
        entity_type: 'client',
        entity_id: client.id,
        description: `Client ${client.name} updated`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(200).json({
        status: 'success',
        message: 'Client updated successfully',
        data: client
      });
    } catch (error) {
      console.error('Update client error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to update client',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Delete a client by ID (soft delete by setting is_active to false)
  deleteClient: async (req, res) => {
    try {
      const clientId = req.params.id;
      const client = await Client.findByPk(clientId);

      if (!client) {
        return res.status(404).json({
          status: 'error',
          message: 'Client not found'
        });
      }

      client.is_active = false;
      await client.save();

      await ActivityLog.create({
        user_id: req.user.id,
        action_type: 'delete',
        entity_type: 'client',
        entity_id: client.id,
        description: `Client ${client.name} deactivated`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      return res.status(200).json({
        status: 'success',
        message: 'Client deactivated successfully'
      });
    } catch (error) {
      console.error('Delete client error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to delete client',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

export default clientController;
