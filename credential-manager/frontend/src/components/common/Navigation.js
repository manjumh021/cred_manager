// frontend/src/components/common/Navigation.js
import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Navigation Component
 * Main navigation bar for the application
 */
const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
      <Container fluid>
        <Navbar.Brand as={Link} to="/dashboard">
          <i className="fas fa-key me-2"></i>
          Credential Manager
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="navbar-nav" />
        
        {isAuthenticated && (
          <Navbar.Collapse id="navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/dashboard">
                <i className="fas fa-tachometer-alt me-1"></i> Dashboard
              </Nav.Link>
              
              <Nav.Link as={Link} to="/export">
                <i className="fas fa-file-export me-1"></i> Export
              </Nav.Link>
            </Nav>
            
            <Nav>
              {user && (
                <NavDropdown 
                  title={
                    <>
                      <i className="fas fa-user-circle me-1"></i>
                      {user.first_name || user.username}
                    </>
                  } 
                  id="user-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/settings">
                    <i className="fas fa-cog me-2"></i> Settings
                  </NavDropdown.Item>
                  
                  <NavDropdown.Divider />
                  
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i> Logout
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        )}
      </Container>
    </Navbar>
  );
};

export default Navigation;