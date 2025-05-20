// backend/routes/export.routes.js
const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * Export routes
 * Handles credential export operations
 */

// Export credentials to Excel
// GET /api/export/credentials
router.get('/credentials', authenticate, exportController.exportCredentials);

// Get export history
// GET /api/export/history
router.get('/history', authenticate, authorize(['admin']), exportController.getExportHistory);

module.exports = router;