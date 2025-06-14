import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../common/LoadingSpinner';

const VehicleSelector = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { vehicleId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/vehicles`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setVehicles(response.data);
                setLoading(false);

                // Auto-select the first vehicle if no vehicle is selected
                if (!vehicleId && response.data.length > 0) {
                    navigate(`/dashboard/${response.data[0]._id}`);
                }
            } catch (error) {
                console.error('Error fetching vehicles:', error);
            }
        };

        fetchVehicles();
    }, [navigate, vehicleId]);

    const handleVehicleSelect = (e) => {
        const selectedVehicleId = e.target.value;
        navigate(`/dashboard/${selectedVehicleId}`);
    };

    if (loading) return <LoadingSpinner size='small' message='Loading vehicles...' />;
    if (vehicles.length === 0) return <p>No vehicles found. Please add a vehicle.</p>;

    return (
        <div className="vehicle-selector mb-4">
            <label htmlFor="vehicleDropdown">Select Vehicle:</label>
            <select
                id="vehicleDropdown"
                className="form-select"
                value={vehicleId || ''}
                onChange={handleVehicleSelect}
            >
                <option value="">Select a vehicle</option>
                {vehicles.map((vehicle) => (
                    <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.name} - Odometer: {vehicle.odometer} km
                    </option>
                ))}
            </select>
        </div>
    );
};

export default VehicleSelector;
