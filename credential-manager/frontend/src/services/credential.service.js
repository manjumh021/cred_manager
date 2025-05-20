// frontend/src/services/credential.service.js
import axios from 'axios';

const API_URL = '/api/credentials';

const credentialService = {
  createCredential: (credentialData) => {
    return axios.post(API_URL, credentialData);
  },

  getCredentials: (params) => {
    return axios.get(API_URL, { params });
  },

  getCredentialById: (id) => {
    return axios.get(`${API_URL}/${id}`);
  },

  updateCredential: (id, credentialData) => {
    return axios.put(`${API_URL}/${id}`, credentialData);
  },

  deleteCredential: (id) => {
    return axios.delete(`${API_URL}/${id}`);
  }
};

export default credentialService;
