import React, { useEffect, useState, useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { FilterContext } from '../../context/FilterContext'; // Import Global Filter Context
import { buildUrl, getBackendUrl } from '../../utils/urlHelper'; // Import URL helper functions

const FuelChart = () => {
    const [fuelData, setFuelData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { vehicleId } = useParams();
    // Get clean backend URL from helper
    const backendUrl = getBackendUrl();

    // Use global filter context
    const { selectedYear, selectedMonth } = useContext(FilterContext);

    useEffect(() => {
        const fetchFuelData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(buildUrl(backendUrl, `/api/expenses/${vehicleId}`), {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Filter and format the data based on global filters
                const fuelEntries = response.data
                    .filter(entry => entry.type === 'fuel')
                    .map(entry => ({
                        date: new Date(entry.date),
                        cost: entry.totalCost
                    }))
                    .filter(entry => {
                        const entryYear = entry.date.getFullYear();
                        const entryMonth = entry.date.getMonth() + 1;

                        // Apply global filters
                        return (
                            (selectedYear === 0 || entryYear === selectedYear) &&
                            (selectedMonth === 0 || entryMonth === selectedMonth)
                        );
                    })
                    .sort((a, b) => a.date - b.date); // Sort chronologically

                // Format dates for the chart
                setFuelData(
                    fuelEntries.map(entry => ({
                        date: entry.date.toLocaleDateString(),
                        cost: entry.cost
                    }))
                );
                setLoading(false);
            } catch (error) {
                console.error('Error fetching fuel data:', error);
            }
        };

        fetchFuelData();
    }, [vehicleId, backendUrl, selectedYear, selectedMonth]); // Re-fetch when filters change

    // Custom Tooltip Formatter
    const tooltipFormatter = (value) => {
        return [`₱${value.toFixed(2)}`, 'Cost'];
    };

    if (loading) return <div>Loading fuel data...</div>;
    if (fuelData.length === 0) return <div>No fuel data available for this vehicle.</div>;

    return (
        <div className="card shadow-sm p-4">
            {/* Fuel Cost Chart */}
            <h5 className="card-title">Fuel Costs Over Time</h5>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={fuelData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={tooltipFormatter} />
                    <Line type="monotone" dataKey="cost" stroke="#007bff" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default FuelChart;
