// backend/routes/credential.routes.js
const express = require('express');
const router = express.Router();
const credentialController = require('../controllers/credential.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { check } = require('express-validator');
const validators = require('../middleware/validators');

/**
 * Credential routes
 * Handles CRUD operations for credentials
 */

// Create a new credential
router.post(
  '/',
  authenticate,
  [
    check('client_id', 'Client ID is required').isInt(),
    check('platform_id', 'Platform ID is required').isInt(),
    check('account_name', 'Account name is required').notEmpty(),
    check('username', 'Username is required').notEmpty(),
    check('password', 'Password is required').notEmpty(),
    validators.validate
  ],
  credentialController.createCredential
);

// Get all credentials with pagination and optional filters
router.get('/', authenticate, credentialController.getCredentials);

// Get a single credential by ID
router.get('/:id', authenticate, credentialController.getCredentialById);

// Update a credential by ID
router.put(
  '/:id',
  authenticate,
  [
    check('client_id').optional().isInt(),
    check('platform_id').optional().isInt(),
    check('account_name').optional().notEmpty(),
    check('username').optional().notEmpty(),
    check('password').optional().notEmpty(),
    validators.validate
  ],
  credentialController.updateCredential
);

// Delete (deactivate) a credential by ID
router.delete('/:id', authenticate, credentialController.deleteCredential);

module.exports = router;
