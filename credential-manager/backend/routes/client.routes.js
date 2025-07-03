// backend/routes/client.routes.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');

console.log('clientController:', clientController);
console.log('createClient:', clientController.createClient);
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { check } = require('express-validator');
const validators = require('../middleware/validators');

/**
 * Client routes
 * Handles CRUD operations for clients
 */

// Create a new client
router.post(
  '/',
  authenticate,
  [
    check('name', 'Client name is required').notEmpty(),
    check('email', 'Please include a valid email').optional().isEmail()
  ],
  validators.validate,
  clientController.createClient
);

// Get all clients with pagination and optional filters
router.get('/', authenticate, clientController.getClients);

// Get a single client by ID
router.get('/:id', authenticate, clientController.getClientById);

// Update a client by ID
router.put(
  '/:id',
  authenticate,
  [
    check('email', 'Please include a valid email').optional().isEmail()
  ],
  validators.validate,
  clientController.updateClient
);

// Delete (deactivate) a client by ID
router.delete('/:id', authenticate, clientController.deleteClient);

module.exports = router;