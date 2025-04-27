import React, { useEffect } from 'react'; // Import useEffect
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel/index';
import Dashboard from './components/Dashboard/Dashboard';
import NoVehicles from './pages/NoVehicles';
import NotFound from './pages/NotFound';
import RedirectToFirstVehicle from './components/RedirectToFirstVehicle';
import RootRedirect from './components/RootRedirect';
import { FilterProvider } from './context/FilterContext';
import NavMenu from './components/NavMenu';

// Enable Bootstrap icons & tooltips
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Tooltip } from 'bootstrap';

// Protected Route Wrapper
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" replace />;
};

function App() {
    // Initialize Bootstrap tooltips inside a React hook
    useEffect(() => {
        const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltips.forEach((tooltip) => {
            new Tooltip(tooltip);
        });
    }, []);

    const token = localStorage.getItem('token');
    let userRole;
    try {
        userRole = JSON.parse(atob(token.split('.')[1])).role;
    } catch {
        userRole = null;
    }

    return (
        <FilterProvider>
            <Router>
                <NavMenu userRole={userRole} />
                <Routes>
                    {/* Handle root route */}
                    <Route path="/" element={<RootRedirect />} />

                    {/* Login route */}
                    <Route path="/login" element={<Login />} />

                    {/* Automatically redirect /dashboard to the first vehicle */}
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <RedirectToFirstVehicle />
                            </PrivateRoute>
                        }
                    />

                    {/* Protected route for specific vehicle dashboards */}
                    <Route
                        path="/dashboard/:vehicleId"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />

                    {/* No Vehicles screen */}
                    <Route
                        path="/no-vehicles"
                        element={
                            <PrivateRoute>
                                <NoVehicles />
                            </PrivateRoute>
                        }
                    />

                    <Route path="/admin" element={<AdminPanel />} />

                    {/* Catch-all for 404 Not Found */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </FilterProvider>
    );
}

export default App;
