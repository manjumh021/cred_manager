// frontend/src/pages/ExportPage.js
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import ExportButton from '../components/export/ExportButton';
import ExportHistory from '../components/export/ExportHistory';

/**
 * Export Page Component
 * Main page for credential export functionality
 */
const ExportPage = () => {
  const [filters, setFilters] = useState({
    clientId: '',
    platformId: '',
    platformCategoryId: ''
  });

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Container fluid className="py-4">
      <h1 className="h3 mb-4">Export Credentials</h1>
      
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Export Options</h5>
                <ExportButton 
                  clientId={filters.clientId || null}
                  platformId={filters.platformId || null}
                  platformCategoryId={filters.platformCategoryId || null}
                />
              </div>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Client</Form.Label>
                      <Form.Select 
                        name="clientId"
                        value={filters.clientId}
                        onChange={handleFilterChange}
                      >
                        <option value="">All Clients</option>
                        {/* Client options would be populated from API */}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Platform</Form.Label>
                      <Form.Select 
                        name="platformId"
                        value={filters.platformId}
                        onChange={handleFilterChange}
                      >
                        <option value="">All Platforms</option>
                        {/* Platform options would be populated from API */}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select 
                        name="platformCategoryId"
                        value={filters.platformCategoryId}
                        onChange={handleFilterChange}
                      >
                        <option value="">All Categories</option>
                        {/* Category options would be populated from API */}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <p className="text-muted small">
                  Select filters to narrow down the credentials to export, or leave all filters empty to export all credentials.
                </p>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <ExportHistory />
        </Col>
      </Row>
    </Container>
  );
};

export default ExportPage;