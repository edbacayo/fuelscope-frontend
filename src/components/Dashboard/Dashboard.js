import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import VehicleSelector from './VehicleSelector';
import FuelChart from './FuelChart';
import ExpenseModal from '../modals/ExpenseModal';
import ServiceModal from '../modals/ServiceModal';
import FuelEfficiencyChart from './FuelEfficiencyChart';
import { FilterContext } from '../../context/FilterContext'; // ✅ Import Filter Context

const Dashboard = () => {
    const { vehicleId } = useParams();
    const { selectedYear, setSelectedYear, selectedMonth, setSelectedMonth } = useContext(FilterContext); // ✅ Get filter values from context
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [efficiencyAlert, setEfficiencyAlert] = useState(null); // 🚨 Alert State
    const [serviceAlerts, setServiceAlerts] = useState([]);
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    // Use useCallback to memoize fetchExpenses function to prevent unnecessary re-renders
    const fetchExpenses = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${backendUrl}/api/expenses/${vehicleId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setExpenses(response.data);

            // Check for efficiency alert (triggered by the backend)
            const latestFuelEntry = response.data.find((entry) => entry.alert);
            if (latestFuelEntry && latestFuelEntry.alert) {
                setEfficiencyAlert(latestFuelEntry.alert);
            }

            // Check for service reminders (triggered by the backend)
            if (response.data.serviceAlerts && response.data.serviceAlerts.length > 0) {
                setServiceAlerts(response.data.serviceAlerts); // Multiple alerts can be set here
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        }
    }, [backendUrl, vehicleId]); // `fetchExpenses` now depends on `vehicleId` and `backendUrl`

    const onExpenseAdded = () => {
        setLoading(true);
        fetchExpenses(); // Re-fetch expenses to update alerts and service reminders
    };

    const onExpenseDeleted = async () => {
        setLoading(true);
        await fetchExpenses(); // ✅ Refresh expenses list
    };

    const handleDeleteExpense = async (expenseId, type) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${backendUrl}/api/expenses/${expenseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // ✅ Refresh the expense list after deletion
            onExpenseDeleted();
    
            // ✅ If it was a service expense, refresh service reminders
            if (type === 'service') {
                fetchVehicleData(); // Refresh vehicle data to update reminders
            }
        } catch (err) {
            console.error('Error deleting expense:', err);
        }
    };


    // fetch vehicle data to check service reminders
    const fetchVehicleData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${backendUrl}/api/vehicles/${vehicleId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const vehicle = response.data;
            checkServiceReminders(vehicle.serviceReminders, vehicle.odometer);
        } catch (error) {
            console.error('Error fetching vehicle data:', error);
        }
    }, [backendUrl, vehicleId]);
    // check service reminders after fetching vehicle data
    const checkServiceReminders = (serviceReminders, currentOdometer) => {
        if (!serviceReminders) return;

        const alerts = [];
        const currentDate = new Date();

        serviceReminders.forEach((reminder) => {
            if (reminder.isEnabled) {
                const dueOdometer = reminder.lastServiceOdometer + reminder.odometerInterval;
                const dueDate = new Date(reminder.lastServiceDate);
                dueDate.setMonth(dueDate.getMonth() + reminder.timeIntervalMonths);

                if (currentOdometer >= dueOdometer) {
                    alerts.push(`🚗 Service due: ${reminder.type} (Odometer)`);
                }
                if (currentDate >= dueDate) {
                    alerts.push(`🕒 Service due: ${reminder.type} (Time-based)`);
                }
            }
        });
        setServiceAlerts(alerts);
    };

    useEffect(() => {
        fetchVehicleData();
        fetchExpenses();
    }, [fetchVehicleData, fetchExpenses,]);


    // ✅ Handle alert from new expense entry
    const handleNewExpenseAlert = (alertMessage) => {
        setEfficiencyAlert(alertMessage);
    };
    // Update this function to handle new service-related alerts
    const handleNewServiceAlert = (alertMessage) => {
        setServiceAlerts(alertMessage); // Set the service alert
    };
    const handleCloseAlert = (index) => {
        // Remove the alert at the given index
        const updatedAlerts = serviceAlerts.filter((_, alertIndex) => alertIndex !== index);
        setServiceAlerts(updatedAlerts); // Update the state with the filtered alerts
    };

    // 🔢 Apply filters (Year & Month)
    const filteredExpenses = expenses.filter((entry) => {
        const entryDate = new Date(entry.date);
        const entryYear = entryDate.getFullYear();
        const entryMonth = entryDate.getMonth() + 1;

        return (
            (selectedYear === 0 || entryYear === selectedYear) && // ✅ Show all years if 0 is selected
            (selectedMonth === 0 || entryMonth === selectedMonth) // ✅ Show all months if 0 is selected
        );
    }).sort((a, b) => new Date(b.date) - new Date(a.date)); // sort by newest to oldest

    // 🚗 Fuel Efficiency Calculations
    const fuelEntries = filteredExpenses
        .filter((entry) => entry.type === 'fuel')
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    let totalEfficiency = 0;
    let bestEfficiency = 0;
    let lastEfficiency = 0;
    let count = 0;

    for (let i = 1; i < fuelEntries.length; i++) {
        const previousEntry = fuelEntries[i - 1];
        const currentEntry = fuelEntries[i];

        const distance = currentEntry.odometer - previousEntry.odometer;
        const liters = currentEntry.fuelDetails?.liters || 0;

        if (distance > 0 && liters > 0) {
            const efficiency = distance / liters;
            totalEfficiency += efficiency;
            bestEfficiency = Math.max(bestEfficiency, efficiency);
            lastEfficiency = efficiency; // Last valid entry
            count++;
        }
    }

    const averageEfficiency = count > 0 ? totalEfficiency / count : 0;

    // 🔢 Calculate totals based on filters
    const totalFuelCost = filteredExpenses
        .filter((entry) => entry.type === 'fuel')
        .reduce((acc, curr) => acc + (curr.totalCost || 0), 0);

    const totalServiceCost = filteredExpenses
        .filter((entry) => entry.type === 'service')
        .reduce((acc, curr) => acc + (curr.totalCost || 0), 0);

    const totalInsuranceCost = filteredExpenses
        .filter((entry) => entry.type === 'insurance')
        .reduce((acc, curr) => acc + (curr.totalCost || 0), 0);

    const totalRegistrationCost = filteredExpenses
        .filter((entry) => entry.type === 'registration')
        .reduce((acc, curr) => acc + (curr.totalCost || 0), 0);

    // ✅ Generate a list of years dynamically
    const years = [
        0, // ✅ 0 will represent "All Years"
        ...Array.from({ length: 10 }, (_, index) => new Date().getFullYear() - index)
    ];

    const months = [
        { value: 0, name: 'All Months' }, // ✅ Show all months
        { value: 1, name: 'January' },
        { value: 2, name: 'February' },
        { value: 3, name: 'March' },
        { value: 4, name: 'April' },
        { value: 5, name: 'May' },
        { value: 6, name: 'June' },
        { value: 7, name: 'July' },
        { value: 8, name: 'August' },
        { value: 9, name: 'September' },
        { value: 10, name: 'October' },
        { value: 11, name: 'November' },
        { value: 12, name: 'December' }
    ];

    if (loading) return <p>Loading dashboard...</p>;

    return (
        <div className="container mt-4">
            {/* 🚗 Vehicle Selector */}
            <VehicleSelector />

            {/* 🚨 Fuel Efficiency Alert Notification */}
            {efficiencyAlert && (
                <div className="alert alert-warning alert-dismissible fade show mt-3" role="alert">
                    {efficiencyAlert}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setEfficiencyAlert(null)}
                    />
                </div>
            )}

            {serviceAlerts && serviceAlerts.length > 0 && (
                serviceAlerts.map((alert, index) => (
                    <div key={index} className="alert alert-warning alert-dismissible fade show mt-3" role="alert">
                        {alert} {/* Display individual alert message */}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => handleCloseAlert(index)} // Close button functionality
                        />
                    </div>
                ))
            )}


            {/* 📅 Year & Month Filters */}
            <div className="row mb-4">
                {/* Year Filter */}
                <div className="col-md-6">
                    <label htmlFor="yearFilter" className="form-label">Year</label>
                    <select
                        id="yearFilter"
                        className="form-select"
                        value={selectedYear}
                        onChange={(e) => {
                            const year = parseInt(e.target.value);
                            setSelectedYear(year);

                            if (year === 0) setSelectedMonth(0); // ✅ Auto-select "All Months"
                        }}
                    >
                        <option value={0}>All Time</option> {/* ✅ Add All Years Option */}
                        {years
                            .filter((year) => year !== 0)
                            .map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                    </select>
                </div>

                {/* Month Filter */}
                <div className="col-md-6">
                    <label htmlFor="monthFilter" className="form-label">Month</label>
                    <select
                        id="monthFilter"
                        className="form-select"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        disabled={selectedYear === 0} // ✅ Disable when "All Years" is selected
                    >
                        {months.map((month) => (
                            <option key={month.value} value={month.value}>
                                {month.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 🚀 Quick Action Buttons */}
            <div className="d-flex justify-content-end my-3">
                <button
                    className="btn btn-primary me-2"
                    onClick={() => setShowExpenseModal(true)}
                >
                    ➕ Add Expense
                </button>
                <button
                    className="btn btn-success"
                    onClick={() => setShowServiceModal(true)}
                >
                    🛠️ Add Service
                </button>
            </div>

            {/* 🔲 Responsive Summary Cards with Icons & Tooltips */}
            <div className="row g-3">
                {/* Fuel Cost */}
                <div className="col-lg-3 col-md-6 col-sm-12 d-flex">
                    <div className="card shadow-sm p-3 text-center flex-grow-1">
                        <h5 className="card-title">
                            <i className="bi bi-fuel-pump"></i> Total Fuel Cost
                        </h5>
                        <p
                            className="card-text"
                            data-bs-toggle="tooltip"
                            title="Total fuel expenses over the selected period."
                        >
                            ₱{totalFuelCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* Service Cost */}
                <div className="col-lg-3 col-md-6 col-sm-12 d-flex">
                    <div className="card shadow-sm p-3 text-center flex-grow-1">
                        <h5 className="card-title">
                            <i className="bi bi-wrench"></i> Total Service Cost
                        </h5>
                        <p
                            className="card-text"
                            data-bs-toggle="tooltip"
                            title="Total costs from maintenance and services."
                        >
                            ₱{totalServiceCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* Insurance Cost */}
                <div className="col-lg-3 col-md-6 col-sm-12 d-flex">
                    <div className="card shadow-sm p-3 text-center flex-grow-1">
                        <h5 className="card-title">
                            <i className="bi bi-file-earmark-check"></i> Insurance Cost
                        </h5>
                        <p
                            className="card-text"
                            data-bs-toggle="tooltip"
                            title="All insurance-related expenses."
                        >
                            ₱{totalInsuranceCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* Registration Cost */}
                <div className="col-lg-3 col-md-6 col-sm-12 d-flex">
                    <div className="card shadow-sm p-3 text-center flex-grow-1">
                        <h5 className="card-title">
                            <i className="bi bi-file-text"></i> Registration Cost
                        </h5>
                        <p
                            className="card-text"
                            data-bs-toggle="tooltip"
                            title="All vehicle registration-related expenses."
                        >
                            ₱{totalRegistrationCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </div>

            {/* 🔥 Fuel Efficiency Metrics */}
            <div className="row g-3 mt-3">
                <div className="col-lg-4 col-md-6 col-sm-12 d-flex">
                    <div className="card shadow-sm p-3 text-center flex-grow-1 bg-light">
                        <h5 className="card-title">🏁 Last Efficiency</h5>
                        <p className="card-text">{lastEfficiency.toFixed(2)} km/L</p>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-12 d-flex">
                    <div className="card shadow-sm p-3 text-center flex-grow-1 bg-light">
                        <h5 className="card-title">📊 Average Efficiency</h5>
                        <p className="card-text">{averageEfficiency.toFixed(2)} km/L</p>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-12 d-flex">
                    <div className="card shadow-sm p-3 text-center flex-grow-1 bg-light">
                        <h5 className="card-title">🏆 Best Efficiency</h5>
                        <p className="card-text">{bestEfficiency.toFixed(2)} km/L</p>
                    </div>
                </div>
            </div>

            {/* 📊 Charts Section */}
            <div className="row g-3 mt-3">
                <div className="col-12">
                    <FuelChart />
                </div>
                <div className="col-12">
                    <FuelEfficiencyChart />
                </div>
            </div>

            {/* 🧾 Expense List */}
            <div className="mt-4">
                <h4>Recent Expenses</h4>
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Details</th>
                                <th>Total Cost</th>
                                <th>Odometer</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.length > 0 ? (
                                filteredExpenses.map((expense) => (
                                    <tr key={expense._id}>
                                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                                        <td>{expense.type.toUpperCase()}</td>
                                        <td>
                                            {expense.type === 'fuel' && `Fuel: ${expense.fuelDetails?.fuelBrand}`}
                                            {expense.type === 'service' && `Service: ${expense.serviceDetails?.serviceType}`}
                                            {expense.type === 'insurance' && 'Insurance Payment'}
                                            {expense.type === 'registration' && 'Vehicle Registration'}
                                        </td>
                                        <td>₱{expense.totalCost.toLocaleString()}</td>
                                        <td>{expense.odometer} km</td>
                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDeleteExpense(expense._id, expense.type)}
                                            >
                                                🗑 Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center">No expenses recorded.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* Modals for Adding Entries */}
            <ExpenseModal
                show={showExpenseModal}
                onClose={() => setShowExpenseModal(false)}
                vehicleId={vehicleId}
                onAlert={handleNewExpenseAlert}
                onExpenseAdded={onExpenseAdded} // Pass re-fetch handler here
            />
            <ServiceModal
                show={showServiceModal}
                onClose={() => setShowServiceModal(false)}
                vehicleId={vehicleId}
                onAlert={handleNewServiceAlert}
                onExpenseAdded={onExpenseAdded} // Pass the onExpenseAdded function here
            />

        </div>
    );
};

export default Dashboard;
