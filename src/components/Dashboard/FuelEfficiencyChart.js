import React, { useEffect, useState, useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { FilterContext } from '../../context/FilterContext';
import LoadingSpinner from '../common/LoadingSpinner';

const FuelEfficiencyChart = () => {
    const [efficiencyData, setEfficiencyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { vehicleId } = useParams();
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    // Use global filters
    const { selectedYear, selectedMonth } = useContext(FilterContext);

    useEffect(() => {
        const fetchFuelData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${backendUrl}/api/expenses/${vehicleId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Filter and sort fuel entries
                const fuelEntries = response.data
                    .filter(entry => entry.type === 'fuel')
                    .map(entry => ({
                        date: new Date(entry.date),
                        odometer: entry.odometer,
                        liters: entry.fuelDetails.liters
                    }))
                    .filter(entry => {
                        const entryYear = entry.date.getFullYear();
                        const entryMonth = entry.date.getMonth() + 1;

                        return (
                            (selectedYear === 0 || entryYear === selectedYear) &&
                            (selectedMonth === 0 || entryMonth === selectedMonth)
                        );
                    })
                    .sort((a, b) => a.date - b.date); 

                // Calculate fuel efficiency (km/L)
                const efficiencyEntries = [];
                for (let i = 1; i < fuelEntries.length; i++) {
                    const previousEntry = fuelEntries[i - 1];
                    const currentEntry = fuelEntries[i];

                    const distance = currentEntry.odometer - previousEntry.odometer;
                    const liters = currentEntry.liters;

                    if (distance > 0 && liters > 0) {
                        efficiencyEntries.push({
                            date: currentEntry.date.toLocaleDateString(),
                            efficiency: distance / liters
                        });
                    }
                }

                setEfficiencyData(efficiencyEntries);
            } catch (error) {
                console.error('Error fetching fuel efficiency data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFuelData();
    }, [vehicleId, backendUrl, selectedYear, selectedMonth]);

    // Custom Tooltip Formatter
    const tooltipFormatter = (value) => {
        return [`${value.toFixed(2)} km/L`, 'Efficiency'];
    };

    if (loading) return <LoadingSpinner size='small' message='Loading fuel efficiency data...' />;
    if (efficiencyData.length === 0) return <div>No fuel efficiency data available for this vehicle.</div>;

    return (
        <div className="card shadow-sm p-4">
            {/* Fuel Efficiency Chart */}
            <h5 className="card-title">Fuel Efficiency Over Time (km/L)</h5>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={efficiencyData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={tooltipFormatter} />
                    <Line type="monotone" dataKey="efficiency" stroke="#28a745" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default FuelEfficiencyChart;
