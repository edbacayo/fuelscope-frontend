import axios from 'axios';

// Create a custom axios instance
const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL || 'https://fuelscope-backend-6aa4dc7f46c7.herokuapp.com',
    withCredentials: true
});

// Automatically attach the token to every request
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // ✅ Get the token from localStorage
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;
