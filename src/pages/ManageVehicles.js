import React, { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import NoVehicles from './NoVehicles';
import AddVehicleModal from '../components/modals/AddVehicleModal';
import 'bootstrap/js/dist/modal';

const ManageVehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toasts, setToasts] = useState([]);
    // Determine user role for vehicle limit
    const token = localStorage.getItem('token');
    let role;
    try { role = JSON.parse(atob(token.split('.')[1])).role; } catch { role = null; }
    const maxVehicles = role === 'premium' ? 2 : role === 'user' ? 1 : Infinity;

    const addToast = useCallback((message, variant = 'success') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, variant }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    }, []);

    const fetchVehicles = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/vehicles');
            setVehicles(res.data.map(v => ({
                ...v,
                editedName: v.name,
                editedOdometer: String(v.odometer),
                isEditing: false,
                hasChanged: false,
            })));
        } catch (err) {
            console.error(err);
            addToast(err.response?.data?.error || 'Error fetching vehicles', 'danger');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
      fetchVehicles();
    }, [fetchVehicles]);

    // Inline edit handlers
    const handleEdit = id => {
      setVehicles(prev => prev.map(v =>
        v._id === id
          ? { ...v, isEditing: true, editedName: v.name, editedOdometer: String(v.odometer), hasChanged: false }
          : v
      ));
    };

    const handleCancel = id => {
      setVehicles(prev => prev.map(v =>
        v._id === id
          ? { ...v, isEditing: false, editedName: v.name, editedOdometer: String(v.odometer), hasChanged: false }
          : v
      ));
    };

    const handleFieldChange = (id, field, value) => {
      setVehicles(prev => prev.map(v => {
        if (v._id !== id) return v;
        const updated = { ...v, ...(field === 'name' ? { editedName: value } : { editedOdometer: value }) };
        updated.hasChanged =
          updated.editedName !== v.name ||
          Number(updated.editedOdometer) !== v.odometer;
        return updated;
      }));
    };

    useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

    const handleUpdate = async (id, name, odometer) => {
        try {
            await api.put(`/api/vehicles/${id}`, { name, odometer: Number(odometer) });
            fetchVehicles();
        } catch (err) {
            console.error(err);
            addToast(err.response?.data?.error || 'Error updating vehicle', 'danger');
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Deleting '${name}' will remove all related data. This cannot be undone. Continue?`)) {
            try {
                await api.delete(`/api/vehicles/${id}`);
                fetchVehicles();
            } catch (err) {
                console.error(err);
                addToast(err.response?.data?.error || 'Error deleting vehicle', 'danger');
            }
        }
    };

    const handleAdd = async (name, odometer) => {
        if (!name || !odometer) {
            addToast('Name and odometer are required', 'danger');
            return;
        }
        try {
            await api.post('/api/vehicles', { name, odometer: Number(odometer) });
            fetchVehicles();
            addToast('Vehicle added!', 'success');
        } catch (err) {
            console.error(err);
            addToast(err.response?.data?.error || 'Error adding vehicle', 'danger');
        }
    };

    return (
        <div className="container mt-4 position-relative">
          {/* Toast notifications */}
          <div className="toast-container position-fixed bottom-0 end-0 p-3">
            {toasts.map(t => (
              <div key={t.id} className={`toast align-items-center text-white bg-${t.variant} border-0 show mb-2`} role="alert">
                <div className="d-flex">
                  <div className="toast-body">{t.message}</div>
                  <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}></button>
                </div>
              </div>
            ))}
          </div>
          {/* Header with Add Vehicle modal trigger */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Manage Vehicles</h3>
            {vehicles.length < maxVehicles && (
              <button className="btn btn-sm btn-success" data-bs-toggle="modal" data-bs-target="#addVehicleModal">Add Vehicle</button>
            )}
          </div>
          {/* Loading Spinner */}
          {loading && (
            <div className="d-flex justify-content-center my-4">
              <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
            </div>
          )}
          {/* Empty state */}
          {!loading && vehicles.length === 0 && <NoVehicles />}
          {/* Vehicles Table */}
          {!loading && vehicles.length > 0 && (
             <table className="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Odometer</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {vehicles.map(v => (
                        <tr key={v._id}>
                            <td>
                                <input
                                    type="text"
                                    className="form-control"
                                    disabled={!v.isEditing}
                                    value={v.editedName}
                                    onChange={e => handleFieldChange(v._id, 'name', e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="form-control"
                                    disabled={!v.isEditing}
                                    value={v.editedOdometer}
                                    onChange={e => handleFieldChange(v._id, 'odometer', e.target.value)}
                                />
                            </td>
                            <td>
                                {!v.isEditing ? (
                                    <>
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => handleEdit(v._id)}
                                        >Edit</button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(v._id, v.name)}
                                        >Delete</button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="btn btn-sm btn-success me-2"
                                            disabled={!v.hasChanged}
                                            onClick={() => handleUpdate(v._id, v.editedName, v.editedOdometer)}
                                        >Save</button>
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => handleCancel(v._id)}
                                        >Cancel</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          )}
          {/* Add Vehicle Modal */}
          <AddVehicleModal onAdd={handleAdd} />
        </div>
    );
};

export default ManageVehicles;
