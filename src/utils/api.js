// src/lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'https://fuelscope-backend-6aa4dc7f46c7.herokuapp.com',
  withCredentials: true
});

// automatically read token from localStorage on each request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;
