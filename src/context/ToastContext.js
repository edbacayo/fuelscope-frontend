import React, { createContext, useState, useContext, useEffect } from 'react';

const ToastContext = createContext();

// Global toast function that can be used outside React components
let globalShowToast = (message, type) => {
  console.warn('Toast system not initialized yet', message);
};

// Export a function that can be imported anywhere
export const showGlobalToast = (message, type = 'info', duration = 5000) => {
  globalShowToast(message, type, duration);
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  };
  
  // Store the function in the global reference when the component mounts
  useEffect(() => {
    globalShowToast = showToast;
    return () => {
      globalShowToast = (message) => console.warn('Toast system unmounted', message);
    };
  }, []);

  const hideToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);