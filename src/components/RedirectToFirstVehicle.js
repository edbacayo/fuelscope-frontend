import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';

const RedirectToFirstVehicle = () => {
    const [redirectPath, setRedirectPath] = useState(null);

    useEffect(() => {
        const fetchVehicles = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setRedirectPath('/login');
                return;
            }

            try {
                const response = await api.get('/vehicles');

                if (response.data.length > 0) {
                    // Redirect to the first vehicle's dashboard
                    setRedirectPath(`/dashboard/${response.data[0]._id}`);
                } else {
                    // No vehicles found → Go to no-vehicles page
                    setRedirectPath('/no-vehicles');
                }
            } catch (error) {
                console.error('Error fetching vehicles:', error);
                setRedirectPath('/login');
            }
        };

        fetchVehicles();
    }, []);

    // Perform redirection once the path is ready
    if (redirectPath) {
        return <Navigate to={redirectPath} replace />;
    }

    // Loading state until redirection is resolved
    return <p>Redirecting to your dashboard...</p>;
};

export default RedirectToFirstVehicle;
