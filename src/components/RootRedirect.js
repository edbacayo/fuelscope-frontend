import React from 'react';
import { Navigate } from 'react-router-dom';

const RootRedirect = () => {
    const token = localStorage.getItem('token');

    // If token exists → Redirect to /dashboard
    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    // No token → Redirect to /login
    return <Navigate to="/login" replace />;
};

export default RootRedirect;
