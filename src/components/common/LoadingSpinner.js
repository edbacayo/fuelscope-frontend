import React from 'react';
import './LoadingSpinner.css';  

/**
 * LoadingSpinner component for displaying loading states
 * @param {Object} props Component props
 * @param {string} [props.size='medium'] - Size of the spinner ('small', 'medium', 'large')
 * @param {boolean} [props.fullscreen=false] - Whether to display as fullscreen overlay
 * @param {string} [props.message] - Optional message to display with the spinner
 * @param {boolean} [props.overlay=false] - Whether to display as an overlay on a container
 */

export const LoadingSpinner = ({ 
  size = 'medium', 
  fullscreen = false,
  message,
  overlay = false
}) => {
  const spinnerClasses = [
    'loading-spinner',
    `spinner-${size}`,
    fullscreen ? 'spinner-fullscreen' : '',
    overlay ? 'spinner-overlay' : ''
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'spinner-container',
    fullscreen ? 'fullscreen' : '',
    overlay ? 'overlay' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className={spinnerClasses}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        {message && <p className="spinner-message">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
