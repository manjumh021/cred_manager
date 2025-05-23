import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group controlId="username" className="mb-3">
        <Form.Label>Username</Form.Label>
        <Form.Control 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
        />
      </Form.Group>
      <Form.Group controlId="password" className="mb-3">
        <Form.Label>Password</Form.Label>
        <Form.Control 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
      </Form.Group>
      <Button type="submit" disabled={loading} className="w-100">
        {loading ? 'Logging in...' : 'Login'}
      </Button>
    </Form>
  );
};

export default LoginForm;
