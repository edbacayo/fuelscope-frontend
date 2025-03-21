import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ isAuthenticated, role, requiredRole }) => {
    if (!isAuthenticated) {
        return <Navigate to="/login" />; // Redirect to login if not logged in
    }

    if (requiredRole && role !== requiredRole) {
        return <Navigate to="/" />; // Redirect if user doesn't have permission
    }

    return <Outlet />;
};

export default PrivateRoute;
