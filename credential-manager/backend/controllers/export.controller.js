// backend/controllers/export.controller.js
const Credential = require('../models/credential.model');
const Client = require('../models/client.model');
const { Platform, PlatformCategory } = require('../models/platform.model');
const { ActivityLog, ExportLog } = require('../models/activity.model');
const { Op } = require('sequelize');
const ExcelExportUtil = require('../utils/excelExport');
const path = require('path');
const fs = require('fs');
const User = require('../models/user.model');

/**
 * Export Controller
 * Handles credential export operations
 */
const exportController = {
  /**
   * Export credentials to Excel
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  exportCredentials: async (req, res) => {
    try {
      const { client_id, platform_id, platform_category_id, include_inactive } = req.query;
      
      // Build query conditions
      const whereConditions = {};
      
      if (client_id) {
        whereConditions.client_id = client_id;
      }
      
      if (platform_id) {
        whereConditions.platform_id = platform_id;
      }
      
      if (!include_inactive || include_inactive !== 'true') {
        whereConditions.is_active = true;
      }
      
      // Include platform category filter if provided
      const platformInclude = { model: Platform, attributes: ['id', 'name', 'category_id'] };
      
      if (platform_category_id) {
        platformInclude.where = { category_id: platform_category_id };
      }
      
      // Get credentials with related data
      const credentials = await Credential.findAll({
        where: whereConditions,
        include: [
          { model: Client, attributes: ['id', 'name', 'contact_person', 'email'] },
          platformInclude
        ],
        order: [
          [Client, 'name', 'ASC'],
          [Platform, 'name', 'ASC'],
          ['account_name', 'ASC']
        ]
      });
      
      if (credentials.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'No credentials found with the specified filters'
        });
      }
      
      // Create export utility instance
      const excelExport = new ExcelExportUtil();
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `credentials_export_${timestamp}.xlsx`;
      
      // Create export directory if it doesn't exist
      const exportDir = path.join(__dirname, '..', 'exports');
      excelExport.ensureDirectoryExists(exportDir);
      const filePath = path.join(exportDir, filename);
      
      // Generate Excel file
      await excelExport.generateCredentialExport(credentials, filePath);
      
      // Log export activity
      await ExportLog.create({
        user_id: req.user.id,
        export_type: 'credentials',
        file_name: filename,
        record_count: credentials.length,
        filters: JSON.stringify(req.query),
        ip_address: req.ip
      });
      
      await ActivityLog.create({
        user_id: req.user.id,
        action_type: 'export',
        entity_type: 'credential',
        description: `Exported ${credentials.length} credentials to Excel`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });
      
      // Send file to client
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error('Download error:', err);
          return res.status(500).json({
            status: 'error',
            message: 'Failed to download file'
          });
        }
        
        // Delete file after download
        setTimeout(() => {
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting temporary export file:', err);
          });
        }, 5000); // 5 seconds delay to ensure download completes
      });
    } catch (error) {
      console.error('Export error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to export credentials',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  
  /**
   * Get export history
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getExportHistory: async (req, res) => {
    try {
      const { limit = 10, offset = 0 } = req.query;
      
      const exports = await ExportLog.findAndCountAll({
        include: [{ model: User, attributes: ['id', 'username', 'first_name', 'last_name'] }],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      return res.status(200).json({
        status: 'success',
        data: {
          exports: exports.rows,
          total: exports.count
        }
      });
    } catch (error) {
      console.error('Get export history error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get export history',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = exportController;