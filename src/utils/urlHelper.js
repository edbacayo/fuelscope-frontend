/**
 * Helper function to ensure proper URL construction without double slashes
 * @param {string} baseUrl - The base URL (e.g., https://example.com)
 * @param {string} path - The API path (e.g., /api/resource)
 * @returns {string} - Properly formatted URL
 */
export const buildUrl = (baseUrl, path) => {
  // Remove trailing slash from baseUrl if it exists
  const cleanBaseUrl = baseUrl ? baseUrl.replace(/\/$/, '') : '';
  
  // Ensure path starts with a single slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${cleanBaseUrl}${cleanPath}`;
};

/**
 * Get the backend URL from environment variables or use default
 * @returns {string} - Backend URL without trailing slash
 */
export const getBackendUrl = () => {
  const url = process.env.REACT_APP_BACKEND_URL || 'https://fuelscope-backend-6aa4dc7f46c7.herokuapp.com';
  return url.replace(/\/$/, '');
};
