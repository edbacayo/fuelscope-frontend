import { useToast, showGlobalToast } from '../context/ToastContext';

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

// Shared auth error handling state
export let hasShownAuthError = false;

// Shared function to handle auth errors with debouncing
export const handleAuthErrorWithDebounce = (showToastFn) => {
  if (!hasShownAuthError) {
    hasShownAuthError = true;
    
    // Show toast using either the provided function or the global function
    if (showToastFn) {
      showToastFn("Session expired. Please log in again.", 'danger');
    } else {
      // Use global toast function as fallback
      showGlobalToast("Session expired. Please log in again.", 'danger');
    }
    
    setTimeout(() => {
      hasShownAuthError = false;
    }, 5000);
  }
  
  // Always clear token and redirect
  localStorage.removeItem('token');
  
  setTimeout(() => {
    window.location.href = "/login";
  }, 1500);
};

export const useErrorHandler = () => {
  const { showToast } = useToast();
  
  const handleError = (error, customMessage = null) => {
    console.error('Error occurred:', error);
    
    const type = getErrorType(error);
    const message = customMessage || getUserMessage(error);
    
    // Handle authentication errors with debouncing
    if (type === ERROR_TYPES.AUTH) {
      handleAuthErrorWithDebounce((msg, type) => showToast(msg, type));
      return { type, message };
    }
    
    // Show toast with appropriate type
    let toastType = 'danger';
    if (type === ERROR_TYPES.NETWORK) toastType = 'warning';
    if (type === ERROR_TYPES.VALIDATION) toastType = 'warning';
    
    showToast(message, toastType);
    
    return { type, message };
  };
  
  return { handleError };
};
