import axios from 'axios';

// Clean the backend URL to prevent double slashes
const cleanUrl = (url) => url ? url.replace(/\/$/, '') : '';

// Create a custom axios instance
const axiosInstance = axios.create({
    baseURL: cleanUrl(process.env.REACT_APP_BACKEND_URL || 'https://fuelscope-backend-6aa4dc7f46c7.herokuapp.com'),
    withCredentials: true
});

// Add interceptor to fix URL paths with double slashes
axiosInstance.interceptors.request.use(config => {
    // Fix URL if it contains double slashes (except after protocol)
    if (config.url && config.url.includes('//')) {
        config.url = config.url.replace(/([^:])\/{2,}/g, '$1/');
    }
    return config;
});

// Automatically attach the token to every request
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Get the token from localStorage
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;
