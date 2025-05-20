// frontend/src/components/common/Footer.js
import React from 'react';
import { Container } from 'react-bootstrap';

/**
 * Footer Component
 * Simple footer for the application
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-light py-3 mt-auto">
      <Container fluid className="text-center text-muted">
        <small>
          &copy; {currentYear} Credential Manager | All Rights Reserved
        </small>
      </Container>
    </footer>
  );
};

export default Footer;