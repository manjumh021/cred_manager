import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import credentialService from '../services/credential.service';
import clientService from '../services/client.service';

const CredentialDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [credential, setCredential] = useState({
    client_id: '',
    platform_id: '',
    account_name: '',
    username: '',
    password: '',
    url: '',
    notes: '',
    expiry_date: '',
    is_active: true,
    additionalFields: []
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchClients();
    if (id && id !== 'new') {
      fetchCredential();
      setIsEditMode(false);
    } else {
      setIsEditMode(true);
    }
  }, [id]);

  const fetchClients = async () => {
    try {
      const response = await clientService.getClients({ page: 1, limit: 100 });
      setClients(response.data.data.clients);
    } catch (err) {
      setError('Failed to load clients');
    }
  };

  const fetchCredential = async () => {
    setLoading(true);
    try {
      const response = await credentialService.getCredentialById(id);
      const data = response.data.data;
      setCredential({
        ...data,
        expiry_date: data.expiry_date ? data.expiry_date.split('T')[0] : '',
        additionalFields: data.additionalFields || []
      });
    } catch (err) {
      setError('Failed to load credential');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCredential(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAdditionalFieldChange = (index, e) => {
    const { name, value } = e.target;
    const newFields = [...credential.additionalFields];
    newFields[index][name] = value;
    setCredential(prev => ({
      ...prev,
      additionalFields: newFields
    }));
  };

  const addAdditionalField = () => {
    setCredential(prev => ({
      ...prev,
      additionalFields: [...prev.additionalFields, { field_name: '', field_value: '' }]
    }));
  };

  const removeAdditionalField = (index) => {
    const newFields = [...credential.additionalFields];
    newFields.splice(index, 1);
    setCredential(prev => ({
      ...prev,
      additionalFields: newFields
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id === 'new') {
        await credentialService.createCredential(credential);
      } else {
        await credentialService.updateCredential(id, credential);
      }
      navigate('/credentials');
    } catch (err) {
      setError('Failed to save credential');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>{id === 'new' ? 'Add New Credential' : isEditMode ? 'Edit Credential' : 'Credential Details'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Client *</label>
          <select name="client_id" value={credential.client_id} onChange={handleChange} required disabled={!isEditMode} className="form-control">
            <option value="">Select Client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Platform ID *</label>
          <input type="number" name="platform_id" value={credential.platform_id} onChange={handleChange} required disabled={!isEditMode} className="form-control" />
          {/* Ideally, platform selection dropdown can be implemented */}
        </div>
        <div className="form-group">
          <label>Account Name *</label>
          <input type="text" name="account_name" value={credential.account_name} onChange={handleChange} required disabled={!isEditMode} className="form-control" />
        </div>
        <div className="form-group">
          <label>Username *</label>
          <input type="text" name="username" value={credential.username} onChange={handleChange} required disabled={!isEditMode} className="form-control" />
        </div>
        <div className="form-group">
          <label>Password *</label>
          <input type="password" name="password" value={credential.password} onChange={handleChange} required disabled={!isEditMode} className="form-control" />
        </div>
        <div className="form-group">
          <label>URL</label>
          <input type="url" name="url" value={credential.url} onChange={handleChange} disabled={!isEditMode} className="form-control" />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea name="notes" value={credential.notes} onChange={handleChange} disabled={!isEditMode} className="form-control" />
        </div>
        <div className="form-group">
          <label>Expiry Date</label>
          <input type="date" name="expiry_date" value={credential.expiry_date} onChange={handleChange} disabled={!isEditMode} className="form-control" />
        </div>
        {isEditMode && (
          <div className="form-group form-check">
            <input type="checkbox" name="is_active" checked={credential.is_active} onChange={handleChange} className="form-check-input" id="isActiveCheck" />
            <label className="form-check-label" htmlFor="isActiveCheck">Active</label>
          </div>
        )}
        <div>
          <h4>Additional Fields</h4>
          {credential.additionalFields.map((field, index) => (
            <div key={index} className="form-row mb-2">
              <div className="col">
                <input
                  type="text"
                  name="field_name"
                  placeholder="Field Name"
                  value={field.field_name}
                  onChange={(e) => handleAdditionalFieldChange(index, e)}
                  disabled={!isEditMode}
                  className="form-control"
                  required
                />
              </div>
              <div className="col">
                <input
                  type="text"
                  name="field_value"
                  placeholder="Field Value"
                  value={field.field_value}
                  onChange={(e) => handleAdditionalFieldChange(index, e)}
                  disabled={!isEditMode}
                  className="form-control"
                  required
                />
              </div>
              {isEditMode && (
                <div className="col-auto">
                  <button type="button" className="btn btn-danger" onClick={() => removeAdditionalField(index)}>Remove</button>
                </div>
              )}
            </div>
          ))}
          {isEditMode && (
            <button type="button" className="btn btn-secondary mb-3" onClick={addAdditionalField}>Add Additional Field</button>
          )}
        </div>
        <div>
          {isEditMode ? (
            <>
              <button type="submit" className="btn btn-primary mr-2">Save</button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditMode(false)}>Cancel</button>
            </>
          ) : (
            <button type="button" className="btn btn-warning" onClick={() => setIsEditMode(true)}>Edit</button>
          )}
          <button type="button" className="btn btn-secondary ml-2" onClick={() => navigate('/credentials')}>Back to List</button>
        </div>
      </form>
    </div>
  );
};

export default CredentialDetails;
