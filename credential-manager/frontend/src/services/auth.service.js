// frontend/src/services/auth.service.js
import axios from 'axios';

const API_URL = '/api/auth';

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: token ? `Bearer ${token}` : ''
  };
};

const authService = {
  register: (userData) => {
    return axios.post(`${API_URL}/register`, userData);
  },

  login: (credentials) => {
    return axios.post(`${API_URL}/login`, credentials);
  },

  logout: (token) => {
    return axios.post(`${API_URL}/logout`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  getProfile: (token) => {
    return axios.get(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  updateProfile: (profileData, token) => {
    return axios.put(`${API_URL}/profile`, profileData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};

export default authService;
