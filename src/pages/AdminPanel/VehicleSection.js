import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import VehicleRow from '../../components/AdminPanel/VehicleRow';
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal';
import PaginationControls from '../../components/AdminPanel/PaginationControls';

export default function VehicleSection() {
    const [vehicles, setVehicles] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // Delete confirmation modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.role !== 'admin') {
                navigate('/login', { replace: true });
            }
        } catch {
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    const fetchVehicles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/admin/vehicles');
            setVehicles(response.data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    const handleDeleteClick = (vehicle) => {
        setVehicleToDelete(vehicle);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!vehicleToDelete) return;
        
        try {
            await api.delete(`/api/admin/vehicles/${vehicleToDelete._id}`);
            fetchVehicles();
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            alert('Failed to delete vehicle. Please try again.');
        }
    };

    // Search, sort & pagination states
    const [vehicleSearch, setVehicleSearch] = useState('');
    const [vehicleSortField, setVehicleSortField] = useState('name');
    const [vehicleSortDir, setVehicleSortDir] = useState('asc');
    const [vehiclePage, setVehiclePage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // Sort handlers
    const handleVehicleSort = field => {
        if (vehicleSortField === field) setVehicleSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setVehicleSortField(field); setVehicleSortDir('asc'); }
    };

    // Filter, sort & paginate data
    const filteredVehicles = useMemo(() => {
        const f = vehicleSearch.toLowerCase();
        return vehicles
            .filter(v => 
                v.name.toLowerCase().includes(f) || 
                (v.userName && v.userName.toLowerCase().includes(f))
            )
            .sort((a, b) => {
                let av, bv;
                
                if (vehicleSortField === 'userName') {
                    av = a.userName || '';
                    bv = b.userName || '';
                } else if (vehicleSortField === 'expenseCount') {
                    av = a.expenseCount || 0;
                    bv = b.expenseCount || 0;
                } else if (vehicleSortField === 'lastExpenseDate') {
                    av = a.lastExpenseDate ? new Date(a.lastExpenseDate) : new Date(0);
                    bv = b.lastExpenseDate ? new Date(b.lastExpenseDate) : new Date(0);
                } else {
                    av = a[vehicleSortField];
                    bv = b[vehicleSortField];
                }
                
                if (av < bv) return vehicleSortDir === 'asc' ? -1 : 1;
                if (av > bv) return vehicleSortDir === 'asc' ? 1 : -1;
                return 0;
            });
    }, [vehicles, vehicleSearch, vehicleSortField, vehicleSortDir]);
    
    const totalVehiclePages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE);
    const displayVehicles = filteredVehicles.slice(
        (vehiclePage - 1) * ITEMS_PER_PAGE, 
        vehiclePage * ITEMS_PER_PAGE
    );

    return (
        <>
            <DeleteConfirmationModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Vehicle"
                message={`Are you sure you want to delete the vehicle "${vehicleToDelete?.name}"? This action cannot be undone and will delete ALL expense records associated with this vehicle.`}
            />
            
            <section className="mb-5">
                <h2>Admin Panel - Vehicle Management</h2>
                <div className="row mb-2">
                    <div className="col-sm-4">
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Search Vehicles" 
                            value={vehicleSearch}
                            onChange={e => { setVehicleSearch(e.target.value); setVehiclePage(1); }} 
                        />
                    </div>
                </div>
                
                {loading ? (
                    <div className="text-center my-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th style={{ cursor: 'pointer' }} onClick={() => handleVehicleSort('userName')}>
                                        User {vehicleSortField === 'userName' ? (vehicleSortDir === 'asc' ? '▲' : '▼') : ''}
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => handleVehicleSort('name')}>
                                        Vehicle Name {vehicleSortField === 'name' ? (vehicleSortDir === 'asc' ? '▲' : '▼') : ''}
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => handleVehicleSort('expenseCount')}>
                                        Expense Count {vehicleSortField === 'expenseCount' ? (vehicleSortDir === 'asc' ? '▲' : '▼') : ''}
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => handleVehicleSort('lastExpenseDate')}>
                                        Latest Expense {vehicleSortField === 'lastExpenseDate' ? (vehicleSortDir === 'asc' ? '▲' : '▼') : ''}
                                    </th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayVehicles.length > 0 ? (
                                    displayVehicles.map(vehicle => (
                                        <VehicleRow
                                            key={vehicle._id}
                                            vehicle={vehicle}
                                            onDelete={() => handleDeleteClick(vehicle)}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">No vehicles found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        
                        {filteredVehicles.length > 0 && (
                            <PaginationControls 
                                current={vehiclePage} 
                                total={totalVehiclePages} 
                                onPageChange={setVehiclePage} 
                            />
                        )}
                    </>
                )}
            </section>
        </>
    );
}
