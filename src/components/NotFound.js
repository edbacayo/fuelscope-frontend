import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard'); // Redirect to dashboard if logged in
        } else {
            navigate('/'); // Redirect to login if not logged in
        }
    };

    return (
        <div className="container mt-5 text-center">
            <h1 className="display-4">404 - Page Not Found</h1>
            <p className="lead">The page you’re looking for doesn’t exist or has been moved.</p>
            <button onClick={handleGoBack} className="btn btn-primary mt-3">
                Go Back
            </button>
        </div>
    );
};

export default NotFound;
