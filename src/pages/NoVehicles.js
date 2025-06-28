import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useErrorHandler } from '../utils/errorHandler';
import api from '../utils/api';

const NoVehicles = () => {
    const [vehicleName, setVehicleName] = useState('');
    const [odometer, setOdometer] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { handleError } = useErrorHandler();

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(
                `/api/vehicles`,
                {
                    name: vehicleName,
                    odometer: parseFloat(odometer),
                }
            );

            // Redirect to dashboard for the new vehicle
            navigate(`/dashboard/${response.data._id}`);
        } catch (error) {
            handleError(error, 'Failed to add vehicle');
            setError('Failed to add vehicle. Please try again.');
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center">No Vehicles Found</h2>
            <p className="text-center">Add a vehicle to start tracking your expenses.</p>

            <form onSubmit={handleAddVehicle} className="mt-4">
                <div className="mb-3">
                    <label>Vehicle Name</label>
                    <input
                        type="text"
                        className="form-control"
                        value={vehicleName}
                        onChange={(e) => setVehicleName(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label>Initial Odometer Reading (km)</label>
                    <input
                        type="number"
                        className="form-control"
                        value={odometer}
                        onChange={(e) => setOdometer(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="text-danger">{error}</p>}
                <button type="submit" className="btn btn-primary w-100">Add Vehicle</button>
            </form>
        </div>
    );
};

export default NoVehicles;
