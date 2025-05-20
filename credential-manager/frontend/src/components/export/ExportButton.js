// frontend/src/components/export/ExportButton.js
import React, { useState } from 'react';
import { Button, Spinner, Modal, Form, Alert } from 'react-bootstrap';
import exportService from '../../services/export.service';

/**
 * Export Button Component
 * Provides UI for exporting credentials with filters
 */
const ExportButton = ({ clientId, platformId, platformCategoryId }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Handle export button click
  const handleExportClick = () => {
    setShowModal(true);
  };

  // Close modal and reset state
  const handleClose = () => {
    setShowModal(false);
    setError(null);
    setSuccess(null);
  };

  // Handle export confirmation
  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Prepare filters based on props and modal selections
      const filters = {};
      
      if (clientId) filters.client_id = clientId;
      if (platformId) filters.platform_id = platformId;
      if (platformCategoryId) filters.platform_category_id = platformCategoryId;
      if (includeInactive) filters.include_inactive = true;
      
      // Call export service
      const result = await exportService.exportCredentials(filters);
      
      setSuccess(`Successfully exported credentials to ${result.filename}`);
      setTimeout(() => {
        handleClose();
      }, 2000); // Close modal after 2 seconds on success
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline-primary" 
        size="sm" 
        onClick={handleExportClick}
        className="ms-2"
      >
        <i className="fas fa-file-export me-1"></i> Export
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Export Credentials</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <p>Export credentials to Excel with the following options:</p>
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox" 
                label="Include inactive credentials" 
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleExport} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-1"
                />
                Exporting...
              </>
            ) : (
              'Export'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ExportButton;