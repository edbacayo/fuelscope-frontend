// src/lib/api.js
import axios from 'axios';

// Clean the backend URL to prevent double slashes
const cleanUrl = (url) => url ? url.replace(/\/$/, '') : '';

const api = axios.create({
  baseURL: cleanUrl(process.env.REACT_APP_BACKEND_URL || 'https://fuelscope-backend-6aa4dc7f46c7.herokuapp.com'),
  withCredentials: true
});

// Add interceptor to fix URL paths with double slashes
api.interceptors.request.use(config => {
  // Fix URL if it contains double slashes (except after protocol)
  if (config.url && config.url.includes('//')) {
    config.url = config.url.replace(/([^:])\/{2,}/g, '$1/');
  }
  return config;
});

// automatically read token from localStorage on each request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;
