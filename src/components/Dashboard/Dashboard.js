import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import VehicleSelector from './VehicleSelector';
import FuelChart from './FuelChart';
import ExpenseModal from '../modals/ExpenseModal';
import ServiceModal from '../modals/ServiceModal';
import FuelEfficiencyChart from './FuelEfficiencyChart';
import FuellyImportModal from '../modals/FuellyImportModal';
import { FilterContext } from '../../context/FilterContext'; 
import api from '../../utils/api';
import { useErrorHandler } from '../../utils/errorHandler';
import LoadingSpinner from '../common/LoadingSpinner';

const Dashboard = () => {
    const { vehicleId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedYear, setSelectedYear, selectedMonth, setSelectedMonth } = useContext(FilterContext); 
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showFuellyModal, setShowFuellyModal] = useState(false); 
    const [efficiencyAlert, setEfficiencyAlert] = useState(null); 
    const [serviceAlerts, setServiceAlerts] = useState([]);
    const [upcomingReminders, setUpcomingReminders] = useState([]);
    const [expensePage, setExpensePage] = useState(1);
    const EXPENSES_PER_PAGE = 10;
    const { handleError } = useErrorHandler();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    
    const fetchExpenses = useCallback(async () => {
        try {
            const response = await api.get(`/api/expenses/${vehicleId}`);

            setExpenses(response.data);

            const latestFuelEntry = response.data.find((entry) => entry.alert);
            if (latestFuelEntry && latestFuelEntry.alert) {
                setEfficiencyAlert(latestFuelEntry.alert);
            }

            if (response.data.serviceAlerts && response.data.serviceAlerts.length > 0) {
                setServiceAlerts(response.data.serviceAlerts); 
            }

            setLoading(false);
        } catch (error) {
            handleError(error, 'Failed to load expense data');
            setLoading(false);
        }
    }, [vehicleId, handleError]);

    const fetchUpcomingReminders = useCallback(async () => {
        try {
            const response = await api.get(`/api/vehicles/${vehicleId}/reminders/upcoming`);
            setUpcomingReminders(response.data);
        } catch (error) {
            handleError(error, 'Failed to load upcoming reminders');
        }
    }, [vehicleId, handleError]);

    const onExpenseAdded = () => {
        setLoading(true);
        fetchExpenses(); 
        setRefreshTrigger(prev => prev + 1);
    };

    const onExpenseDeleted = async () => {
        setLoading(true);
        await fetchExpenses(); 
        setRefreshTrigger(prev => prev + 1);
    };

    const handleDeleteExpense = async (expenseId, type) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;

        try {
            await api.delete(`/api/expenses/${expenseId}`);

            onExpenseDeleted();

            if (type === 'service') {
                fetchVehicleData(); 
            }
        } catch (error) {
            handleError(error, 'Failed to delete expense');
        }
    };

    // fetch vehicle data to check service reminders
    const fetchVehicleData = useCallback(async () => {
        try {
            const response = await api.get(`/api/vehicles/${vehicleId}`);

            const vehicle = response.data;
            checkServiceReminders(vehicle.serviceReminders, vehicle.odometer);
        } catch (error) {
            handleError(error, 'Failed to load vehicle data');
        }
    }, [vehicleId, handleError]);

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
        fetchUpcomingReminders();
    }, [fetchVehicleData, fetchExpenses, fetchUpcomingReminders]);

    useEffect(() => {
        const els = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        els.forEach(el => new window.bootstrap.Tooltip(el));
    }, []);

    // Alert handlers
    const handleNewExpenseAlert = (alertMessage) => {
        setEfficiencyAlert(alertMessage);
    };
    const handleNewServiceAlert = (alertMessage) => {
        setServiceAlerts(alertMessage);
    };
    const handleCloseAlert = (index) => {
        const updatedAlerts = serviceAlerts.filter((_, i) => i !== index);
        setServiceAlerts(updatedAlerts);
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('import') === 'fuelly') {
            setShowFuellyModal(true);
            navigate(location.pathname, { replace: true });
        }
    }, [location.search, navigate, location.pathname]);

    const filteredExpenses = expenses.filter((entry) => {
        const entryDate = new Date(entry.date);
        const entryYear = entryDate.getFullYear();
        const entryMonth = entryDate.getMonth() + 1;

        return (
            (selectedYear === 0 || entryYear === selectedYear) &&
            (selectedMonth === 0 || entryMonth === selectedMonth)
        );
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalExpensePages = Math.ceil(filteredExpenses.length / EXPENSES_PER_PAGE);
    const paginatedExpenses = useMemo(() => {
        const start = (expensePage - 1) * EXPENSES_PER_PAGE;
        return filteredExpenses.slice(start, start + EXPENSES_PER_PAGE);
    }, [filteredExpenses, expensePage]);

    // Fuel Efficiency Calculations
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
            lastEfficiency = efficiency; 
            count++;
        }
    }

    const averageEfficiency = count > 0 ? totalEfficiency / count : 0;

    // Calculate totals based on filters
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

    // Generate a list of years dynamically
    const years = [
        0, 
        ...Array.from({ length: 10 }, (_, index) => new Date().getFullYear() - index)
    ];

    const months = [
        { value: 0, name: 'All Months' }, 
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

    if (loading) return <LoadingSpinner size='large' message='Loading dashboard...' />;         

    return (
        <div className="container mt-4">
            {/* Vehicle Selector */}
            <VehicleSelector />

            {/* Fuel Efficiency Alert Notification */}
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
                        {alert}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => handleCloseAlert(index)}
                        />
                    </div>
                ))
            )}

            {/* Upcoming Service Reminders */}
            <div className="accordion mb-4" id="reminderAccordion">
                <div className="accordion-item">
                    <h2 className="accordion-header" id="headingReminders">
                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseReminders" aria-expanded="true" aria-controls="collapseReminders">
                            Upcoming Service Reminders ({upcomingReminders.length})
                        </button>
                    </h2>
                    <div id="collapseReminders" className="accordion-collapse collapse show" aria-labelledby="headingReminders" data-bs-parent="#reminderAccordion">
                        <div className="accordion-body p-0">
                            <ul className="list-group list-group-flush">
                                {upcomingReminders.map((reminder, idx) => (
                                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                        {reminder.type}
                                        <span className="badge rounded-pill bg-primary">
                                            {reminder.kmUntilDue > 0
                                                ? `Due in ${reminder.kmUntilDue} km`
                                                : `Due by ${new Date(reminder.dueDate).toLocaleDateString()}`
                                            }
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Year & Month Filters */}
            <div className="py-2 my-3">
                <div className="container d-flex flex-wrap align-items-center justify-content-between">
                    <div className="d-flex flex-wrap">
                        <div className="me-3 mb-2">
                            <label htmlFor="yearFilter" className="form-label mb-0">Year</label>
                            <select id="yearFilter" className="form-select" value={selectedYear} onChange={e => { const y = parseInt(e.target.value); setSelectedYear(y); if (y === 0) setSelectedMonth(0); }}>
                                <option value={0}>All Time</option>
                                {years.filter(y => y !== 0).map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div className="me-3 mb-2">
                            <label htmlFor="monthFilter" className="form-label mb-0">Month</label>
                            <select id="monthFilter" className="form-select" value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} disabled={selectedYear === 0}>
                                {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="mb-2">
                        <button className="btn btn-primary me-2" onClick={() => setShowExpenseModal(true)}>Add Expense</button>
                        <button className="btn btn-success" onClick={() => setShowServiceModal(true)}>Add Service</button>
                    </div>
                </div>
            </div>

            {/* Responsive Summary Cards with Icons & Tooltips */}
            <div className="row g-3">
                {/* Fuel Cost */}
                <div className="col-lg-3 col-md-6 col-6 d-flex">
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
                <div className="col-lg-3 col-md-6 col-6 d-flex">
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
                <div className="col-lg-3 col-md-6 col-6 d-flex">
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
                <div className="col-lg-3 col-md-6 col-6 d-flex">
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

            {/* Fuel Efficiency Metrics */}
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

            {/* Charts Section */}
            <div className="row g-3 mt-3">
                <div className="col-12">
                    <FuelChart refreshTrigger={refreshTrigger} />
                </div>
                <div className="col-12">
                    <FuelEfficiencyChart refreshTrigger={refreshTrigger} />
                </div>
            </div>

            {/* Expense List */}
            <div className="mt-4">
                <h4>Recent Expenses</h4>
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Details</th>
                                <th>Price per Liter</th>
                                <th>Total Cost</th>
                                <th>Odometer</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedExpenses.length > 0 ? (
                                paginatedExpenses.map(expense => (
                                    <tr key={expense._id}>
                                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                                        <td>{expense.type.toUpperCase()}</td>
                                        <td>
                                            {expense.type === 'fuel' && `Fuel: ${expense.fuelDetails?.fuelBrand}`}
                                            {expense.type === 'service' && `Service: ${expense.serviceDetails?.serviceType}`}
                                            {expense.type === 'insurance' && 'Insurance Payment'}
                                            {expense.type === 'registration' && 'Vehicle Registration'}
                                        </td>
                                        <td>{expense.fuelDetails?.pricePerLiter.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? 'N/A'}</td>
                                        <td>₱{expense.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td>{expense.odometer ? `${expense.odometer} km` : 'N/A'}</td>
                                        <td>
                                            <button
                                                className="btn btn-danger rounded-pill btn-sm text-smaller"
                                                onClick={() => handleDeleteExpense(expense._id, expense.type)}
                                            >
                                                Delete
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
                {totalExpensePages > 1 && (
                    <nav>
                        <ul className="pagination justify-content-center mt-3">
                            <li className={`page-item ${expensePage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setExpensePage(p => p - 1)}>Previous</button>
                            </li>
                            {Array.from({ length: totalExpensePages }, (_, i) => (
                                <li key={i} className={`page-item ${expensePage === i + 1 ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => setExpensePage(i + 1)}>{i + 1}</button>
                                </li>
                            ))}
                            <li className={`page-item ${expensePage === totalExpensePages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setExpensePage(p => p + 1)}>Next</button>
                            </li>
                        </ul>
                    </nav>
                )}
                {/* Modals for Adding Entries */}
                <ExpenseModal
                    show={showExpenseModal}
                    onClose={() => setShowExpenseModal(false)}
                    vehicleId={vehicleId}
                    onAlert={handleNewExpenseAlert}
                    onExpenseAdded={onExpenseAdded} 
                />
                <ServiceModal
                    show={showServiceModal}
                    onClose={() => setShowServiceModal(false)}
                    vehicleId={vehicleId}
                    onAlert={handleNewServiceAlert}
                    onExpenseAdded={onExpenseAdded} 
                />
                <FuellyImportModal
                    show={showFuellyModal}
                    onClose={() => setShowFuellyModal(false)}
                    vehicleId={vehicleId}
                    onImport={onExpenseAdded}
                />
            </div>
        </div>
    );
};

export default Dashboard;
