import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [fuelBrands, setFuelBrands] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editedName, setEditedName] = useState('');
    const [serviceTypes, setServiceTypes] = useState([]);
    const [serviceEditingId, setServiceEditingId] = useState(null);
    const [serviceFields, setServiceFields] = useState({ type: '', odometerInterval: '', timeIntervalMonths: '' });
    const [newFuelName, setNewFuelName] = useState('');
    const navigate = useNavigate();

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

    useEffect(() => {
        api.get(`/api/fuel-brands`).then(r => setFuelBrands(r.data));
        api.get(`/api/service-types`).then(r => setServiceTypes(r.data));
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            const response = await api.get(`/api/admin/users`);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const updateUserRole = async (id, newRole) => {
        try {
            await api.put(`/api/admin/users/${id}/role`, { role: newRole });
            fetchUsers();
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };

    const disableUser = async (id) => {
        try {
            await api.put(`/api/admin/users/${id}/disable`, {});
            fetchUsers();
        } catch (error) {
            console.error('Error disabling user:', error);
        }
    };

    const deleteUser = async (id) => {
        try {
            await api.delete(`/api/admin/users/${id}`);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const saveBrand = async (id) => {
        try {
            const name = editedName.trim();
            if (!name) {
                return alert('Name cannot be empty');
            };
            const payload = { name: name };
            await api.put(`/api/fuel-brands/${id}`, payload);
            // reload list
            const { data } = await api.get(`/api/fuel-brands`);
            setFuelBrands(data);
            setEditingId(null);
        } catch (err) {
            console.error(err);
        }
    };

    const disableBrand = async (id) => {
        try {
            await api.patch(`/api/fuel-brands/${id}/disable`);
            setFuelBrands(prev =>
                prev.map(b =>
                    b._id === id ? { ...b, isActive: false } : b
                )
            );
        } catch (err) {
            alert(`Failed to disable fuel brand : ${err.message}`);
            console.error(err);
        }
    };

    const enableBrand = async (id) => {
        try {
            await api.patch(`/api/fuel-brands/${id}/enable`);
            setFuelBrands(prev =>
                prev.map(b =>
                    b._id === id ? { ...b, isActive: true } : b
                )
            );
        } catch (err) {
            console.error(err);
        }
    };

    const addFuelBrand = async () => {
        const name = newFuelName.trim();
        if (!name) return alert('Name is required');
        try {
            await api.post('/api/fuel-brands', { name });
            const { data } = await api.get('/api/fuel-brands');
            setFuelBrands(data);
            setNewFuelName('');
        } catch (err) {
            console.error(err);
        }
    };

    const saveServiceType = async (id) => {
        const { type, odometerInterval, timeIntervalMonths } = serviceFields;
        if (!type.trim()) return alert('Type is required');
        try {
            if (id) {
                // No update endpoint; can reuse delete+post or implement put
                await api.delete(`/api/service-types/${id}`);
            }
            await api.post(`/api/service-types`, { type, odometerInterval: Number(odometerInterval), timeIntervalMonths: Number(timeIntervalMonths) });
            const { data } = await api.get(`/api/service-types`);
            setServiceTypes(data);
            setServiceEditingId(null);
            setServiceFields({ type: '', odometerInterval: '', timeIntervalMonths: '' });
        } catch (err) {
            console.error(err);
        }
    };

    const deleteServiceType = async (id) => {
        try {
            await api.delete(`/api/service-types/${id}`);
            setServiceTypes(prev => prev.filter(s => s._id !== id));
        } catch (err) {
            const resp = err.response;
            if (resp && resp.status === 409 && resp.data.needConfirmation) {
                if (window.confirm(resp.data.message)) {
                    try {
                        await api.delete(`/api/service-types/${id}?force=true`);
                        setServiceTypes(prev => prev.filter(s => s._id !== id));
                    } catch (e) {
                        console.error(e);
                    }
                }
            } else {
                console.error(err);
            }
        }
    };

    // Search, sort & pagination states
    const [userSearch, setUserSearch] = useState('');
    const [userSortField, setUserSortField] = useState('name');
    const [userSortDir, setUserSortDir] = useState('asc');
    const [userPage, setUserPage] = useState(1);
    const [fuelSearch, setFuelSearch] = useState('');
    const [fuelSortField, setFuelSortField] = useState('name');
    const [fuelSortDir, setFuelSortDir] = useState('asc');
    const [fuelPage, setFuelPage] = useState(1);
    const [serviceSearch, setServiceSearch] = useState('');
    const [serviceSortField, setServiceSortField] = useState('type');
    const [serviceSortDir, setServiceSortDir] = useState('asc');
    const [servicePage, setServicePage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // Sort handlers
    const handleUserSort = field => {
        if (userSortField === field) setUserSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setUserSortField(field); setUserSortDir('asc'); }
    };
    const handleFuelSort = field => {
        if (fuelSortField === field) setFuelSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setFuelSortField(field); setFuelSortDir('asc'); }
    };
    const handleServiceSort = field => {
        if (serviceSortField === field) setServiceSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setServiceSortField(field); setServiceSortDir('asc'); }
    };

    // Filter, sort & paginate data
    const filteredUsers = useMemo(() => {
        const f = userSearch.toLowerCase();
        return users
            .filter(u => u.name.toLowerCase().includes(f) || u.email.toLowerCase().includes(f))
            .sort((a, b) => {
                const av = a[userSortField], bv = b[userSortField];
                if (av < bv) return userSortDir === 'asc' ? -1 : 1;
                if (av > bv) return userSortDir === 'asc' ? 1 : -1;
                return 0;
            });
    }, [users, userSearch, userSortField, userSortDir]);
    const totalUserPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const displayUsers = filteredUsers.slice((userPage - 1) * ITEMS_PER_PAGE, userPage * ITEMS_PER_PAGE);
    const filteredFuelBrands = useMemo(() => {
        const f = fuelSearch.toLowerCase();
        return fuelBrands
            .filter(b => b.name.toLowerCase().includes(f))
            .sort((a, b) => {
                const av = a[fuelSortField], bv = b[fuelSortField];
                if (av < bv) return fuelSortDir === 'asc' ? -1 : 1;
                if (av > bv) return fuelSortDir === 'asc' ? 1 : -1;
                return 0;
            });
    }, [fuelBrands, fuelSearch, fuelSortField, fuelSortDir]);
    const totalFuelPages = Math.ceil(filteredFuelBrands.length / ITEMS_PER_PAGE);
    const displayFuelBrands = filteredFuelBrands.slice((fuelPage - 1) * ITEMS_PER_PAGE, fuelPage * ITEMS_PER_PAGE);
    const filteredServiceTypes = useMemo(() => {
        const f = serviceSearch.toLowerCase();
        return serviceTypes
            .filter(s => s.type.toLowerCase().includes(f))
            .sort((a, b) => {
                const av = a[serviceSortField], bv = b[serviceSortField];
                if (av < bv) return serviceSortDir === 'asc' ? -1 : 1;
                if (av > bv) return serviceSortDir === 'asc' ? 1 : -1;
                return 0;
            });
    }, [serviceTypes, serviceSearch, serviceSortField, serviceSortDir]);
    const totalServicePages = Math.ceil(filteredServiceTypes.length / ITEMS_PER_PAGE);
    const displayServiceTypes = filteredServiceTypes.slice((servicePage - 1) * ITEMS_PER_PAGE, servicePage * ITEMS_PER_PAGE);

    return (
        <div className="container mt-4">
            <section>
                <h2>Admin Panel - User Management</h2>
                <div className="row mb-2">
                    <div className="col-sm-4">
                        <input type="text" className="form-control" placeholder="Search Users" value={userSearch}
                            onChange={e => { setUserSearch(e.target.value); setUserPage(1); }} />
                    </div>
                </div>
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th style={{ cursor: 'pointer' }} onClick={() => handleUserSort('name')}>Name {userSortField === 'name' ? (userSortDir === 'asc' ? '▲' : '▼') : ''}</th>
                            <th style={{ cursor: 'pointer' }} onClick={() => handleUserSort('email')}>Email {userSortField === 'email' ? (userSortDir === 'asc' ? '▲' : '▼') : ''}</th>
                            <th>Role</th>
                            <th style={{ cursor: 'pointer' }} onClick={() => handleUserSort('disabled')}>Status {userSortField === 'disabled' ? (userSortDir === 'asc' ? '▲' : '▼') : ''}</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayUsers.map(user => (
                            <tr key={user._id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <select
                                        className="form-select"
                                        value={user.role}
                                        onChange={(e) => updateUserRole(user._id, e.target.value)}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td>{user.disabled ? 'Disabled' : 'Active'}</td>
                                <td>
                                    {!user.disabled && <button className="btn btn-warning btn-sm" onClick={() => disableUser(user._id)}>Disable</button>}
                                    <button className="btn btn-danger btn-sm" onClick={() => deleteUser(user._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="d-flex justify-content-between align-items-center">
                    <small>Page {userPage} of {totalUserPages}</small>
                    <nav><ul className="pagination mb-0">
                        <li className={"page-item " + (userPage === 1 ? 'disabled' : '')}><button className="page-link" onClick={() => setUserPage(p => Math.max(p - 1, 1))}>Previous</button></li>
                        {[...Array(totalUserPages)].map((_, i) => <li key={i} className={"page-item " + (userPage === i + 1 ? 'active' : '')}><button className="page-link" onClick={() => setUserPage(i + 1)}>{i + 1}</button></li>)}
                        <li className={"page-item " + (userPage === totalUserPages ? 'disabled' : '')}><button className="page-link" onClick={() => setUserPage(p => Math.min(p + 1, totalUserPages))}>Next</button></li>
                    </ul></nav>
                </div>
            </section>

            <section className="mt-5">
                <h2>Fuel Brands</h2>
                <div className="row mb-2">
                    <div className="col-sm-4">
                        <input type="text" className="form-control" placeholder="Search Fuel Brands" value={fuelSearch}
                            onChange={e => { setFuelSearch(e.target.value); setFuelPage(1); }} />
                    </div>
                </div>
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th style={{ cursor: 'pointer' }} onClick={() => handleFuelSort('name')}>Name {fuelSortField === 'name' ? (fuelSortDir === 'asc' ? '▲' : '▼') : ''}</th>
                            <th>Active?</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayFuelBrands.map((brand) => (
                            <tr key={brand._id}>
                                <td>
                                    {editingId === brand._id
                                        ? <input
                                            value={editedName}
                                            onChange={e => setEditedName(e.target.value)}
                                            className="form-control form-control-sm"
                                        />
                                        : brand.name
                                    }
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={brand.isActive}
                                        disabled
                                    />
                                </td>
                                <td>
                                    {editingId === brand._id
                                        ? <>
                                            <button
                                                className="btn btn-sm btn-success me-1"
                                                onClick={() => saveBrand(brand._id)}
                                                disabled={editedName.trim() === ''}
                                            >Save</button>
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => setEditingId(null)}
                                            >Cancel</button>
                                        </>
                                        : <>
                                            <button
                                                className="btn btn-sm btn-outline-primary me-1"
                                                onClick={() => {
                                                    setEditingId(brand._id);
                                                    setEditedName(brand.name);
                                                }}
                                            >Edit</button>
                                            <button
                                                className="btn btn-sm btn-outline-danger me-1"
                                                onClick={() => disableBrand(brand._id)}
                                                disabled={!brand.isActive}
                                            >Disable</button>
                                            <button
                                                className="btn btn-sm btn-outline-success"
                                                onClick={() => enableBrand(brand._id)}
                                                disabled={brand.isActive}
                                            >Enable</button>
                                        </>
                                    }
                                </td>
                            </tr>
                        ))}
                        {editingId === null && (
                            <tr>
                                <td>
                                    <input
                                        className="form-control form-control-sm"
                                        placeholder="Name"
                                        value={newFuelName}
                                        onChange={e => setNewFuelName(e.target.value)}
                                    />
                                </td>
                                <td></td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={addFuelBrand}
                                        disabled={!newFuelName.trim()}
                                    >
                                        Add
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="d-flex justify-content-between align-items-center">
                    <small>Page {fuelPage} of {totalFuelPages}</small>
                    <nav><ul className="pagination mb-0">
                        <li className={"page-item " + (fuelPage === 1 ? 'disabled' : '')}><button className="page-link" onClick={() => setFuelPage(p => Math.max(p - 1, 1))}>Previous</button></li>
                        {[...Array(totalFuelPages)].map((_, i) => <li key={i} className={"page-item " + (fuelPage === i + 1 ? 'active' : '')}><button className="page-link" onClick={() => setFuelPage(i + 1)}>{i + 1}</button></li>)}
                        <li className={"page-item " + (fuelPage === totalFuelPages ? 'disabled' : '')}><button className="page-link" onClick={() => setFuelPage(p => Math.min(p + 1, totalFuelPages))}>Next</button></li>
                    </ul></nav>
                </div>
            </section>

            <section className="mt-5">
                <h2>Service Types</h2>
                <div className="row mb-2">
                    <div className="col-sm-4">
                        <input type="text" className="form-control" placeholder="Search Service Types" value={serviceSearch}
                            onChange={e => { setServiceSearch(e.target.value); setServicePage(1); }} />
                    </div>
                </div>
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th style={{ cursor: 'pointer' }} onClick={() => handleServiceSort('type')}>Type {serviceSortField === 'type' ? (serviceSortDir === 'asc' ? '▲' : '▼') : ''}</th>
                            <th style={{ cursor: 'pointer' }} onClick={() => handleServiceSort('odometerInterval')}>Odometer Interval {serviceSortField === 'odometerInterval' ? (serviceSortDir === 'asc' ? '▲' : '▼') : ''}</th>
                            <th style={{ cursor: 'pointer' }} onClick={() => handleServiceSort('timeIntervalMonths')}>Time (months) {serviceSortField === 'timeIntervalMonths' ? (serviceSortDir === 'asc' ? '▲' : '▼') : ''}</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayServiceTypes.map(st => (
                            <tr key={st._id}>
                                <td>
                                    {serviceEditingId === st._id ? (
                                        <input className="form-control form-control-sm" value={serviceFields.type}
                                            onChange={e => setServiceFields(f => ({ ...f, type: e.target.value }))} />
                                    ) : st.type}
                                </td>
                                <td>{serviceEditingId === st._id ? (
                                    <input type="number" className="form-control form-control-sm" value={serviceFields.odometerInterval}
                                        onChange={e => setServiceFields(f => ({ ...f, odometerInterval: e.target.value }))} />
                                ) : st.odometerInterval}</td>
                                <td>{serviceEditingId === st._id ? (
                                    <input type="number" className="form-control form-control-sm" value={serviceFields.timeIntervalMonths}
                                        onChange={e => setServiceFields(f => ({ ...f, timeIntervalMonths: e.target.value }))} />
                                ) : st.timeIntervalMonths}</td>
                                <td>
                                    {serviceEditingId === st._id ? (
                                        <>
                                            <button className="btn btn-sm btn-success me-1" onClick={() => saveServiceType(st._id)}
                                                disabled={!serviceFields.type.trim()}>Save</button>
                                            <button className="btn btn-sm btn-secondary" onClick={() => setServiceEditingId(null)}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn btn-sm btn-outline-primary me-1" onClick={() => {
                                                setServiceEditingId(st._id);
                                                setServiceFields({ type: st.type, odometerInterval: st.odometerInterval.toString(), timeIntervalMonths: st.timeIntervalMonths.toString() });
                                            }}>Edit</button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteServiceType(st._id)}>Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {serviceEditingId === null && (
                            <tr>
                                <td><input className="form-control form-control-sm" placeholder="Type"
                                    value={serviceFields.type} onChange={e => setServiceFields(f => ({ ...f, type: e.target.value }))} /></td>
                                <td><input type="number" className="form-control form-control-sm" placeholder="Odometer"
                                    value={serviceFields.odometerInterval} onChange={e => setServiceFields(f => ({ ...f, odometerInterval: e.target.value }))} /></td>
                                <td><input type="number" className="form-control form-control-sm" placeholder="Months"
                                    value={serviceFields.timeIntervalMonths} onChange={e => setServiceFields(f => ({ ...f, timeIntervalMonths: e.target.value }))} /></td>
                                <td><button className="btn btn-sm btn-primary" onClick={() => saveServiceType(null)}
                                    disabled={!serviceFields.type.trim()}>Add</button></td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="d-flex justify-content-between align-items-center">
                    <small>Page {servicePage} of {totalServicePages}</small>
                    <nav><ul className="pagination mb-0">
                        <li className={"page-item " + (servicePage === 1 ? 'disabled' : '')}><button className="page-link" onClick={() => setServicePage(p => Math.max(p - 1, 1))}>Previous</button></li>
                        {[...Array(totalServicePages)].map((_, i) => <li key={i} className={"page-item " + (servicePage === i + 1 ? 'active' : '')}><button className="page-link" onClick={() => setServicePage(i + 1)}>{i + 1}</button></li>)}
                        <li className={"page-item " + (servicePage === totalServicePages ? 'disabled' : '')}><button className="page-link" onClick={() => setServicePage(p => Math.min(p + 1, totalServicePages))}>Next</button></li>
                    </ul></nav>
                </div>
            </section>
        </div >
    );
};

export default AdminPanel;
