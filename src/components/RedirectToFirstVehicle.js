import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';
import { useErrorHandler } from '../utils/errorHandler';

const RedirectToFirstVehicle = () => {
    const [redirectPath, setRedirectPath] = useState(null);
    const { handleError } = useErrorHandler();

    useEffect(() => {
        const fetchVehicles = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setRedirectPath('/login');
                return;
            }

            try {
                const response = await api.get('api/vehicles');

                if (response.data.length > 0) {
                    // Redirect to the first vehicle's dashboard
                    setRedirectPath(`/dashboard/${response.data[0]._id}`);
                } else {
                    // No vehicles found → Go to no-vehicles page
                    setRedirectPath('/no-vehicles');
                }
            } catch (error) {
                handleError(error, 'Failed to fetch vehicles');
                setRedirectPath('/login');
            }
        };

        fetchVehicles();
    }, [handleError]);

    // Perform redirection once the path is ready
    if (redirectPath) {
        return <Navigate to={redirectPath} replace />;
    }

    // Loading state until redirection is resolved
    return <p>Redirecting to your dashboard...</p>;
};

export default RedirectToFirstVehicle;
