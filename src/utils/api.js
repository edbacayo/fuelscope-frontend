// src/lib/api.js
import axios from "axios";

// Clean the backend URL to prevent double slashes
const cleanUrl = (url) => (url ? url.replace(/\/$/, "") : "");

// Bootstrap toast utility
const showToast = (message, variant = 'danger') => {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white bg-${variant} border-0 show mb-2`;
    toastEl.setAttribute('role', 'alert');

    // Create toast content
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto"></button>
        </div>
    `;

    // Add to container
    toastContainer.appendChild(toastEl);

    // Add close button functionality
    const closeBtn = toastEl.querySelector('.btn-close');
    closeBtn.addEventListener('click', () => toastEl.remove());

    // Auto-remove after 5 seconds
    setTimeout(() => toastEl.remove(), 5000);
};

const api = axios.create({
    baseURL: cleanUrl(
        process.env.REACT_APP_BACKEND_URL || "https://fuelscope-backend-6aa4dc7f46c7.herokuapp.com"
    ),
    withCredentials: true,
});

// Add interceptor to fix URL paths with double slashes
api.interceptors.request.use((config) => {
    // Fix URL if it contains double slashes (except after protocol)
    if (config.url && config.url.includes("//")) {
        config.url = config.url.replace(/([^:])\/{2,}/g, "$1/");
    }
    return config;
});

// automatically read token from localStorage on each request
api.interceptors.request.use((cfg) => {
    const token = localStorage.getItem("token");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response, // Return successful responses as-is
    (error) => {
        // Check if error is due to authentication issues
        if (error.response && (
            error.response.status === 401 || 
            (error.response.status === 400 && 
             error.response.data?.error?.toLowerCase().includes('token'))
        )) {
            // Clear the token
            localStorage.removeItem("token");
            
            // Show toast notification instead of alert
            showToast("Session expired. Please log in again.", "danger");
            
            // Redirect to login page after a short delay to allow the toast to be seen
            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);
        }
        
        // Return the error for further handling
        return Promise.reject(error);
    }
);

export default api;
