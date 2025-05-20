// backend/utils/excelExport.js
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { ActivityLog, ExportLog } = require('../models/activity.model');
const User = require('../models/user.model');
const Client = require('../models/client.model');

/**
 * Excel Export Utility for exporting credentials to Excel format
 */
class ExcelExportUtil {
  /**
   * Creates a directory if it doesn't exist
   * @param {string} dir - Directory path
   */
  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Creates an Excel workbook
   * @returns {ExcelJS.Workbook} - Excel workbook
   */
  createWorkbook() {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SecureVault Credential Manager';
    workbook.lastModifiedBy = 'SecureVault System';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    return workbook;
  }

  /**
   * Exports all credentials to Excel format
   * @param {Object} params - Export parameters
   * @param {Array} params.credentials - Credentials to export
   * @param {Object} params.user - User performing the export
   * @param {Object} params.filters - Filters applied to the export
   * @param {string} params.ip - IP address of the user
   * @returns {Object} - Export result with file path and information
   */
  async exportCredentials({ credentials, user, filters = {}, ip }) {
    try {
      // Create temp directory for exports if it doesn't exist
      const exportDir = path.join(__dirname, '../temp/exports');
      this.ensureDirectoryExists(exportDir);
      
      // Generate unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `credentials_export_${timestamp}_${uuidv4().substring(0, 8)}.xlsx`;
      const filepath = path.join(exportDir, filename);
      
      // Create workbook and worksheet
      const workbook = this.createWorkbook();
      const worksheet = workbook.addWorksheet('Credentials');
      
      // Define columns
      worksheet.columns = [
        { header: 'Client', key: 'client', width: 20 },
        { header: 'Platform', key: 'platform', width: 20 },
        { header: 'Account Name', key: 'accountName', width: 25 },
        { header: 'URL', key: 'url', width: 30 },
        { header: 'Username', key: 'username', width: 25 },
        { header: 'Password', key: 'password', width: 25 },
        { header: 'Notes', key: 'notes', width: 40 },
        { header: 'Expiry Date', key: 'expiryDate', width: 15 },
        { header: 'Created At', key: 'createdAt', width: 20 },
        { header: 'Last Updated', key: 'updatedAt', width: 20 }
      ];
      
      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      };
      
      // Add credential data
      for (const credential of credentials) {
        // Add additional fields to notes if they exist
        let notesText = credential.notes || '';
        if (credential.additionalFields && credential.additionalFields.length > 0) {
          notesText += '\n\nAdditional Fields:';
          credential.additionalFields.forEach(field => {
            notesText += `\n${field.field_name}: ${field.field_value}`;
          });
        }
        
        worksheet.addRow({
          client: credential.client ? credential.client.name : '',
          platform: credential.platform ? credential.platform.name : '',
          accountName: credential.account_name,
          url: credential.url || '',
          username: credential.username,
          password: credential.password,
          notes: notesText,
          expiryDate: credential.expiry_date ? new Date(credential.expiry_date).toLocaleDateString() : '',
          createdAt: new Date(credential.created_at).toLocaleString(),
          updatedAt: new Date(credential.updated_at).toLocaleString()
        });
      }
      
      // Apply protection to the worksheet (password protected)
      const exportPassword = uuidv4().substring(0, 8);
      await worksheet.protect(exportPassword, {
        selectLockedCells: true,
        selectUnlockedCells: true,
        formatCells: false,
        formatColumns: false,
        formatRows: false,
        insertColumns: false,
        insertRows: false,
        insertHyperlinks: false,
        deleteColumns: false,
        deleteRows: false,
        sort: true,
        autoFilter: true,
        pivotTables: false
      });
      
      // Save the workbook
      await workbook.xlsx.writeFile(filepath);
      
      // Log the export activity
      await ActivityLog.create({
        user_id: user.id,
        action_type: 'export',
        entity_type: 'credential',
        description: `Exported ${credentials.length} credentials to Excel`,
        ip_address: ip
      });
      
      // Create export log
      await ExportLog.create({
        user_id: user.id,
        export_type: 'credentials',
        file_name: filename,
        record_count: credentials.length,
        filters: JSON.stringify(filters),
        ip_address: ip
      });
      
      return {
        success: true,
        filename,
        filepath,
        recordCount: credentials.length,
        password: exportPassword
      };
    } catch (error) {
      console.error('Excel export error:', error);
      throw new Error('Failed to export credentials to Excel');
    }
  }

  /**
   * Exports clients with their credentials to Excel format
   * @param {Object} params - Export parameters
   * @param {Array} params.clients - Clients with their credentials to export
   * @param {Object} params.user - User performing the export
   * @param {Object} params.filters - Filters applied to the export
   * @param {string} params.ip - IP address of the user
   * @returns {Object} - Export result with file path and information
   */
  async exportClientCredentials({ clients, user, filters = {}, ip }) {
    try {
      // Create temp directory for exports if it doesn't exist
      const exportDir = path.join(__dirname, '../temp/exports');
      this.ensureDirectoryExists(exportDir);
      
      // Generate unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `client_credentials_export_${timestamp}_${uuidv4().substring(0, 8)}.xlsx`;
      const filepath = path.join(exportDir, filename);
      
      // Create workbook
      const workbook = this.createWorkbook();
      
      let totalCredentials = 0;
      
      // Create a worksheet for each client
      for (const client of clients) {
        const worksheet = workbook.addWorksheet(this.sanitizeWorksheetName(client.name));
        
        // Define columns
        worksheet.columns = [
          { header: 'Platform', key: 'platform', width: 20 },
          { header: 'Account Name', key: 'accountName', width: 25 },
          { header: 'URL', key: 'url', width: 30 },
          { header: 'Username', key: 'username', width: 25 },
          { header: 'Password', key: 'password', width: 25 },
          { header: 'Notes', key: 'notes', width: 40 },
          { header: 'Expiry Date', key: 'expiryDate', width: 15 },
          { header: 'Created At', key: 'createdAt', width: 20 },
          { header: 'Last Updated', key: 'updatedAt', width: 20 }
        ];
        
        // Style the header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' }
        };
        
        // Add client information at the top
        worksheet.insertRow(1, []);
        worksheet.insertRow(1, ['Contact Person:', client.contact_person || '']);
        worksheet.insertRow(1, ['Email:', client.email || '']);
        worksheet.insertRow(1, ['Phone:', client.phone || '']);
        worksheet.insertRow(1, ['Client:', client.name]);
        worksheet.insertRow(1, ['CLIENT INFORMATION']);
        
        // Style the client info header
        worksheet.getRow(1).font = { bold: true, size: 14 };
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4F81BD' }
        };
        worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' } };
        
        // Add credential data
        if (client.credentials && client.credentials.length > 0) {
          totalCredentials += client.credentials.length;
          
          for (const credential of client.credentials) {
            // Add additional fields to notes if they exist
            let notesText = credential.notes || '';
            if (credential.additionalFields && credential.additionalFields.length > 0) {
              notesText += '\n\nAdditional Fields:';
              credential.additionalFields.forEach(field => {
                notesText += `\n${field.field_name}: ${field.field_value}`;
              });
            }
            
            worksheet.addRow({
              platform: credential.platform ? credential.platform.name : '',
              accountName: credential.account_name,
              url: credential.url || '',
              username: credential.username,
              password: credential.password,
              notes: notesText,
              expiryDate: credential.expiry_date ? new Date(credential.expiry_date).toLocaleDateString() : '',
              createdAt: new Date(credential.created_at).toLocaleString(),
              updatedAt: new Date(credential.updated_at).toLocaleString()
            });
          }
        }
      }
      
      // Create a summary worksheet
      const summarySheet = workbook.addWorksheet('Summary', { properties: { tabColor: { argb: 'FF4F81BD' } } });
      summarySheet.columns = [
        { header: 'Client Name', key: 'clientName', width: 30 },
        { header: 'Number of Credentials', key: 'credentialCount', width: 20 },
        { header: 'Contact Person', key: 'contactPerson', width: 25 },
        { header: 'Email', key: 'email', width: 30 }
      ];
      
      // Style the header row
      summarySheet.getRow(1).font = { bold: true };
      summarySheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      };
      
      // Add data to summary
      for (const client of clients) {
        summarySheet.addRow({
          clientName: client.name,
          credentialCount: client.credentials ? client.credentials.length : 0,
          contactPerson: client.contact_person || '',
          email: client.email || ''
        });
      }
      
      // Add total row
      summarySheet.addRow({
        clientName: 'TOTAL',
        credentialCount: totalCredentials,
        contactPerson: '',
        email: ''
      });
      
      // Style total row
      const totalRow = summarySheet.lastRow;
      totalRow.font = { bold: true };
      totalRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      };
      totalRow.getCell(2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      };
      
      // Move summary sheet to the beginning
      workbook.moveSheet(summarySheet.name, 0);
      
      // Apply protection to the workbook (password protected)
      const exportPassword = uuidv4().substring(0, 8);
      for (const worksheet of workbook.worksheets) {
        await worksheet.protect(exportPassword, {
          selectLockedCells: true,
          selectUnlockedCells: true,
          formatCells: false,
          formatColumns: false,
          formatRows: false,
          insertColumns: false,
          insertRows: false,
          insertHyperlinks: false,
          deleteColumns: false,
          deleteRows: false,
          sort: true,
          autoFilter: true,
          pivotTables: false
        });
      }
      
      // Save the workbook
      await workbook.xlsx.writeFile(filepath);
      
      // Log the export activity
      await ActivityLog.create({
        user_id: user.id,
        action_type: 'export',
        entity_type: 'client',
        description: `Exported credentials for ${clients.length} clients to Excel`,
        ip_address: ip
      });
      
      // Create export log
      await ExportLog.create({
        user_id: user.id,
        export_type: 'client_credentials',
        file_name: filename,
        record_count: totalCredentials,
        filters: JSON.stringify(filters),
        ip_address: ip
      });
      
      return {
        success: true,
        filename,
        filepath,
        recordCount: totalCredentials,
        clientCount: clients.length,
        password: exportPassword
      };
    } catch (error) {
      console.error('Excel export error:', error);
      throw new Error('Failed to export client credentials to Excel');
    }
  }

  /**
   * Sanitizes a worksheet name to comply with Excel's limitations
   * @param {string} name - Name to sanitize
   * @returns {string} - Sanitized name
   */
  sanitizeWorksheetName(name) {
    // Excel worksheet names cannot exceed 31 characters
    // and cannot contain these characters: [ ] * ? / \ : 
    let sanitized = name
      .substring(0, 31)
      .replace(/[\[\]\*\?\/\\\:]/g, '_');
      
    // Ensure name is not empty
    if (!sanitized) {
      sanitized = 'Sheet';
    }
    
    return sanitized;
  }

  /**
   * Deletes an export file after it has been downloaded
   * @param {string} filepath - Path to the file to delete
   */
  deleteExportFile(filepath) {
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch (error) {
      console.error('Failed to delete export file:', error);
    }
  }
}

module.exports = new ExcelExportUtil();