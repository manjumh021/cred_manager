// frontend/src/components/export/ExportHistory.js
import React, { useState, useEffect } from 'react';
import { Card, Table, Pagination, Spinner } from 'react-bootstrap';
import exportService from '../../services/export.service';
import { formatDateTime } from '../../utils/formatters';

/**
 * Export History Component
 * Displays a table of export history with pagination
 */
const ExportHistory = () => {
  const [loading, setLoading] = useState(true);
  const [exports, setExports] = useState([]);
  const [totalExports, setTotalExports] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  
  const limit = 10; // Items per page
  
  // Calculate total pages
  const totalPages = Math.ceil(totalExports / limit);
  
  // Load export history data
  const loadExportHistory = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const offset = (page - 1) * limit;
      const response = await exportService.getExportHistory(limit, offset);
      
      if (response.status === 'success') {
        setExports(response.data.exports);
        setTotalExports(response.data.total);
      } else {
        setError('Failed to load export history');
      }
    } catch (err) {
      console.error('Error loading export history:', err);
      setError(err.response?.data?.message || 'Failed to load export history');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadExportHistory(page);
  };
  
  // Load data on component mount
  useEffect(() => {
    loadExportHistory();
  }, []);
  
  // Generate pagination items
  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item 
        key={number} 
        active={number === currentPage}
        onClick={() => handlePageChange(number)}
      >
        {number}
      </Pagination.Item>
    );
  }
  
  return (
    <Card className="mb-4">
      <Card.Header className="bg-light">
        <h5 className="mb-0">Export History</h5>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : exports.length === 0 ? (
          <div className="alert alert-info">No export history found</div>
        ) : (
          <>
            <Table responsive hover className="align-middle">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Filename</th>
                  <th>Records</th>
                </tr>
              </thead>
              <tbody>
                {exports.map((exportItem) => (
                  <tr key={exportItem.id}>
                    <td>{formatDateTime(exportItem.created_at)}</td>
                    <td>
                      {exportItem.user ? 
                        `${exportItem.user.first_name} ${exportItem.user.last_name}` : 
                        'Unknown'}
                    </td>
                    <td>{exportItem.export_type}</td>
                    <td>{exportItem.file_name}</td>
                    <td>{exportItem.record_count}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  <Pagination.First 
                    onClick={() => handlePageChange(1)} 
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1}
                  />
                  {paginationItems}
                  <Pagination.Next 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last 
                    onClick={() => handlePageChange(totalPages)} 
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default ExportHistory;