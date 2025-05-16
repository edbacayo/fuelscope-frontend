import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ExpenseCsvModal from './modals/ExpenseCsvModal';
import 'bootstrap/js/dist/offcanvas';

export default function NavMenu() {
    const navigate = useNavigate();
    const location = useLocation();
    // derive userRole from token so NavMenu re-renders on location change
    const token = localStorage.getItem('token');
    let userRole;
    try {
        userRole = JSON.parse(atob(token.split('.')[1])).role;
    } catch {
        userRole = null;
    }
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
    };

    return (
        <>
            <nav className="navbar navbar-light bg-light">
                <div className="container-fluid">
                    <button
                        className="btn btn-outline-secondary"
                        type="button"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#sidebar"
                        aria-controls="sidebar"
                    >
                        <i className="bi bi-list fs-4"></i>
                    </button>
                    <span className="navbar-brand mb-0 h1 ms-2">
                        <i className="bi bi-speedometer2 me-1"></i>FuelScope
                    </span>
                </div>
            </nav>

            {/* Expense CSV Modal integration */}
            {location.pathname.startsWith('/dashboard/') && location.search.includes('import=csv') && (
                <ExpenseCsvModal
                    show={true}
                    onClose={() => {
                        const url = location.pathname;
                        navigate(url, { replace: true });
                    }}
                    vehicleId={location.pathname.split('/')[2]}
                />
            )}
            <div
                className="offcanvas offcanvas-start"
                tabIndex={-1}
                id="sidebar"
                aria-labelledby="sidebarLabel"
            >
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="sidebarLabel">
                        <i className="bi bi-speedometer2 me-1"></i>FuelScope
                    </h5>
                    <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="offcanvas"
                        aria-label="Close"
                    />
                </div>
                <div className="offcanvas-body d-flex flex-column justify-content-between">
                    <ul className="nav nav-pills flex-column mb-auto">
                        {userRole ? (
                            <>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${location.pathname.startsWith('/dashboard') ? 'active' : ''}`}
                                        onClick={() => navigate('/dashboard')}
                                        data-bs-dismiss="offcanvas"
                                    >
                                        <i className="bi bi-speedometer2 me-2"></i>Dashboard
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${location.pathname.startsWith('/manage-vehicles') ? 'active' : ''}`}
                                        onClick={() => navigate('/manage-vehicles')}
                                        data-bs-dismiss="offcanvas"
                                    >
                                        <i className="bi bi-car-front-fill me-2"></i>Manage Vehicles
                                    </button>
                                </li>
                                {location.pathname.startsWith('/dashboard') && (
                                    <li className="nav-item">
                                        <button
                                            className="nav-link"
                                            onClick={() => navigate(`${location.pathname}?import=fuelly`)}
                                            data-bs-dismiss="offcanvas"
                                        >
                                            <i className="bi bi-file-earmark-arrow-down me-2"></i>Import from Fuelly
                                        </button>
                                    </li>
                                )}
                                {location.pathname.startsWith('/dashboard') && (
                                    <li className="nav-item">
                                        <button
                                            className="nav-link"
                                            onClick={() => navigate(`${location.pathname}?import=csv`)}
                                            data-bs-dismiss="offcanvas"
                                        >
                                            <i className="bi bi-file-earmark-arrow-down me-2"></i>Import/Export CSV
                                        </button>
                                    </li>
                                )}
                                {userRole === 'admin' && (
                                    <li className="nav-item">
                                        <button
                                            className="nav-link"
                                            onClick={() => navigate('/admin')}
                                            data-bs-dismiss="offcanvas"
                                        >
                                            <i className="bi bi-gear-fill me-2"></i>Admin Panel
                                        </button>
                                    </li>
                                )}
                            </>
                        ) : (
                            <li className="nav-item">
                                <button
                                    className="nav-link"
                                    onClick={() => navigate('/login')}
                                    data-bs-dismiss="offcanvas"
                                >
                                    <i className="bi bi-box-arrow-in-right me-2"></i>Login
                                </button>
                            </li>
                        )}
                    </ul>

                    <div>
                        {userRole && (
                            <>
                                <hr />
                                <button
                                    className="btn btn-danger w-100"
                                    onClick={handleLogout}
                                >
                                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
