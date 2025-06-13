import React from 'react';
import { useToast } from '../../context/ToastContext';
import { Button } from 'react-bootstrap';

const TestToast = () => {
  const { showToast } = useToast();

  const testSuccessToast = () => {
    showToast('This is a success toast message!', 'success');
  };

  const testErrorToast = () => {
    showToast('This is an error toast message!', 'danger');
  };

  const testInfoToast = () => {
    showToast('This is an info toast message!', 'info');
  };

  const testWarningToast = () => {
    showToast('This is a warning toast message!', 'warning');
  };

  return (
    <div className="mt-3 p-3 border rounded">
      <h5>Toast Notification Test</h5>
      <div className="d-flex gap-2 flex-wrap">
        <Button variant="success" onClick={testSuccessToast}>Test Success Toast</Button>
        <Button variant="danger" onClick={testErrorToast}>Test Error Toast</Button>
        <Button variant="info" onClick={testInfoToast}>Test Info Toast</Button>
        <Button variant="warning" onClick={testWarningToast}>Test Warning Toast</Button>
      </div>
    </div>
  );
};

export default TestToast;
