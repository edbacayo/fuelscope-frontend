import React from 'react';
import { useToast } from '../../context/ToastContext';
import '../../App.css';

const ToastNotification = () => {
  const { toasts, hideToast } = useToast();

  return (
    <div className="toast-container position-fixed bottom-0 end-0 p-3">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className={`toast show align-items-center text-white bg-${toast.type} border-0`}
          role="alert" 
          aria-live="assertive" 
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body">
              {toast.message}
            </div>
            <button 
              type="button" 
              className="btn-close btn-close-white me-2 m-auto" 
              onClick={() => hideToast(toast.id)}
            ></button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastNotification;