import React, { useEffect, useState } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import clientService from '../services/client.service';
import credentialService from '../services/credential.service';

const Dashboard = () => {
  const [clientCount, setClientCount] = useState(0);
  const [credentialCount, setCredentialCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    setLoading(true);
    try {
      const clientsResponse = await clientService.getClients({ page: 1, limit: 1 });
      const credentialsResponse = await credentialService.getCredentials({ page: 1, limit: 1 });

      setClientCount(clientsResponse.data.data.total || 0);
      setCredentialCount(credentialsResponse.data.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch dashboard counts', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h2>Dashboard</h2>
      <Row>
        <Col md={6}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Total Clients</Card.Title>
              <Card.Text>{clientCount}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Total Credentials</Card.Title>
              <Card.Text>{credentialCount}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
