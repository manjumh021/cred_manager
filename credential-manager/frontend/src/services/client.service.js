// frontend/src/services/client.service.js
import axios from 'axios';

const API_URL = '/api/clients';

const clientService = {
  createClient: (clientData) => {
    return axios.post(API_URL, clientData);
  },

  getClients: (params) => {
    return axios.get(API_URL, { params });
  },

  getClientById: (id) => {
    return axios.get(`${API_URL}/${id}`);
  },

  updateClient: (id, clientData) => {
    return axios.put(`${API_URL}/${id}`, clientData);
  },

  deleteClient: (id) => {
    return axios.delete(`${API_URL}/${id}`);
  }
};

export default clientService;
