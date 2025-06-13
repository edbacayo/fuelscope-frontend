import { useToast } from '../context/ToastContext';

// Error types
export const ERROR_TYPES = {
  NETWORK: 'network',
  SERVER: 'server',
  VALIDATION: 'validation',
  AUTH: 'auth',
  UNKNOWN: 'unknown'
};

// Determine error type based on error object
export const getErrorType = (error) => {
  if (!error) return ERROR_TYPES.UNKNOWN;
  
  if (!navigator.onLine) return ERROR_TYPES.NETWORK;
  
  if (error.message && error.message.toLowerCase().includes('network')) 
    return ERROR_TYPES.NETWORK;
  
  if (error.response) {
    const status = error.response.status;
    if (status === 401 || status === 403 || 
        (status === 400 && error.response.data?.error?.toLowerCase().includes('token'))) 
      return ERROR_TYPES.AUTH;
    
    if (status === 400 || status === 422) 
      return ERROR_TYPES.VALIDATION;
    
    if (status >= 500) 
      return ERROR_TYPES.SERVER;
  }
  
  return ERROR_TYPES.UNKNOWN;
};

// Get user-friendly message based on error
export const getUserMessage = (error) => {
  const type = getErrorType(error);
  
  switch (type) {
    case ERROR_TYPES.NETWORK:
      return "Network error. Please check your connection and try again.";
    
    case ERROR_TYPES.SERVER:
      return "Server error. Our team has been notified.";
    
    case ERROR_TYPES.VALIDATION:
      // Try to extract validation message from response
      if (error.response && error.response.data && error.response.data.error) {
        return error.response.data.error;
      }
      return "Please check your input and try again.";
    
    case ERROR_TYPES.AUTH:
      return "Session expired. Please log in again.";
    
    default:
      return "An unexpected error occurred. Please try again.";
  }
};

// Hook for handling errors in components
export const useErrorHandler = () => {
  const { showToast } = useToast();
  
  const handleError = (error, customMessage = null) => {
    console.error('Error occurred:', error);
    
    const type = getErrorType(error);
    const message = customMessage || getUserMessage(error);
    
    // Show toast with appropriate type
    let toastType = 'danger';
    if (type === ERROR_TYPES.NETWORK) toastType = 'warning';
    if (type === ERROR_TYPES.VALIDATION) toastType = 'warning';
    
    showToast(message, toastType);
    
    // Handle authentication errors
    if (type === ERROR_TYPES.AUTH) {
      // Clear token
      localStorage.removeItem('token');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    }
    
    return { type, message };
  };
  
  return { handleError };
};
