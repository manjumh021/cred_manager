// frontend/src/services/export.service.js
import axios from 'axios';
import { getAuthHeader } from './auth.service';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Service for handling credential exports
 */
const exportService = {
  /**
   * Export credentials to Excel with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise} - Promise that resolves to the file download
   */
  exportCredentials: async (filters = {}) => {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      if (filters.client_id) {
        queryParams.append('client_id', filters.client_id);
      }
      
      if (filters.platform_id) {
        queryParams.append('platform_id', filters.platform_id);
      }
      
      if (filters.platform_category_id) {
        queryParams.append('platform_category_id', filters.platform_category_id);
      }
      
      if (filters.include_inactive) {
        queryParams.append('include_inactive', filters.include_inactive);
      }
      
      const queryString = queryParams.toString();
      const url = `${API_URL}/export/credentials${queryString ? `?${queryString}` : ''}`;
      
      // Use axios to get the file as a blob
      const response = await axios.get(url, {
        headers: getAuthHeader(),
        responseType: 'blob' // Important for file downloads
      });
      
      // Create a download link and trigger it
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'credentials_export.xlsx';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/i);
        if (filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true, filename };
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  },
  
  /**
   * Get export history with pagination
   * @param {Number} limit - Number of records to fetch
   * @param {Number} offset - Offset for pagination
   * @returns {Promise} - Promise that resolves to export history data
   */
  getExportHistory: async (limit = 10, offset = 0) => {
    try {
      const response = await axios.get(
        `${API_URL}/export/history?limit=${limit}&offset=${offset}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Get export history error:', error);
      throw error;
    }
  }
};

export default exportService;