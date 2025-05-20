import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import clientService from '../services/client.service';

const ClientDetails = () => {
  const { id } = useParams();
  const history = useHistory();
  const [client, setClient] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      fetchClient();
      setIsEditMode(false);
    } else {
      setIsEditMode(true);
    }
  }, [id]);

  const fetchClient = async () => {
    setLoading(true);
    try {
      const response = await clientService.getClientById(id);
      setClient(response.data.data);
    } catch (err) {
      setError('Failed to load client');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setClient(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id === 'new') {
        await clientService.createClient(client);
      } else {
        await clientService.updateClient(id, client);
      }
      history.push('/clients');
    } catch (err) {
      setError('Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>{id === 'new' ? 'Add New Client' : isEditMode ? 'Edit Client' : 'Client Details'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name *</label>
          <input type="text" name="name" value={client.name} onChange={handleChange} required className="form-control" disabled={!isEditMode} />
        </div>
        <div className="form-group">
          <label>Contact Person</label>
          <input type="text" name="contact_person" value={client.contact_person} onChange={handleChange} className="form-control" disabled={!isEditMode} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={client.email} onChange={handleChange} className="form-control" disabled={!isEditMode} />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input type="text" name="phone" value={client.phone} onChange={handleChange} className="form-control" disabled={!isEditMode} />
        </div>
        <div className="form-group">
          <label>Address</label>
          <textarea name="address" value={client.address} onChange={handleChange} className="form-control" disabled={!isEditMode} />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea name="notes" value={client.notes} onChange={handleChange} className="form-control" disabled={!isEditMode} />
        </div>
        {isEditMode && (
          <div className="form-group form-check">
            <input type="checkbox" name="is_active" checked={client.is_active} onChange={handleChange} className="form-check-input" id="isActiveCheck" />
            <label className="form-check-label" htmlFor="isActiveCheck">Active</label>
          </div>
        )}
        <div>
          {isEditMode ? (
            <>
              <button type="submit" className="btn btn-primary mr-2">Save</button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditMode(false)}>Cancel</button>
            </>
          ) : (
            <button type="button" className="btn btn-warning" onClick={() => setIsEditMode(true)}>Edit</button>
          )}
          <button type="button" className="btn btn-secondary ml-2" onClick={() => history.push('/clients')}>Back to List</button>
        </div>
      </form>
    </div>
  );
};

export default ClientDetails;
