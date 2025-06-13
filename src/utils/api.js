import axios from "axios";
import { getErrorType, ERROR_TYPES } from "./errorHandler";
import { showGlobalToast } from "../context/ToastContext";

// Clean the backend URL to prevent double slashes
const cleanUrl = (url) => (url ? url.replace(/\/$/, "") : "");

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
        const errorType = getErrorType(error);
        if (errorType === ERROR_TYPES.AUTH) {
            // Clear the token
            localStorage.removeItem("token");
            
            // Show toast notification before redirecting
            showGlobalToast("Session expired. Please log in again.", "danger");
            
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
