import React, { useEffect, useState } from 'react';
import clientService from '../../services/client.service';
import { Link } from 'react-router-dom';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientService.getClients({ page: 1, limit: 50 });
      setClients(response.data.data.clients);
    } catch (err) {
      setError('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading clients...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Clients</h2>
      <Link to="/clients/new" className="btn btn-primary mb-3">Add New Client</Link>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact Person</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client.id}>
              <td>{client.name}</td>
              <td>{client.contact_person}</td>
              <td>{client.email}</td>
              <td>{client.phone}</td>
              <td>{client.is_active ? 'Yes' : 'No'}</td>
              <td>
                <Link to={`/clients/${client.id}`} className="btn btn-sm btn-info mr-2">View</Link>
                <Link to={`/clients/${client.id}/edit`} className="btn btn-sm btn-warning">Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientList;
