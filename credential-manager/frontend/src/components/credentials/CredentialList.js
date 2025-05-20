import React, { useEffect, useState } from 'react';
import credentialService from '../../services/credential.service';
import { Link } from 'react-router-dom';

const CredentialList = () => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const response = await credentialService.getCredentials({ page: 1, limit: 50 });
      setCredentials(response.data.data.credentials);
    } catch (err) {
      setError('Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading credentials...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Credentials</h2>
      <Link to="/credentials/new" className="btn btn-primary mb-3">Add New Credential</Link>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Account Name</th>
            <th>Client</th>
            <th>Platform</th>
            <th>Username</th>
            <th>Expiry Date</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {credentials.map(credential => (
            <tr key={credential.id}>
              <td>{credential.account_name}</td>
              <td>{credential.client ? credential.client.name : ''}</td>
              <td>{credential.platform ? credential.platform.name : ''}</td>
              <td>{credential.username}</td>
              <td>{credential.expiry_date ? new Date(credential.expiry_date).toLocaleDateString() : ''}</td>
              <td>{credential.is_active ? 'Yes' : 'No'}</td>
              <td>
                <Link to={`/credentials/${credential.id}`} className="btn btn-sm btn-info mr-2">View</Link>
                <Link to={`/credentials/${credential.id}/edit`} className="btn btn-sm btn-warning">Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CredentialList;
