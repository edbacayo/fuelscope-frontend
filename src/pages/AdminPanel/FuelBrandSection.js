import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import FuelBrandRow from '../../components/AdminPanel/FuelBrandRow';
import PaginationControls from '../../components/AdminPanel/PaginationControls';

export default function FuelBrandSection() {
    const [brands, setBrands] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editedName, setEditedName] = useState('');
    const [newName, setNewName] = useState('');
    const navigate = useNavigate();

    // auth guard
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login', { replace: true });
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.role !== 'admin') navigate('/login', { replace: true });
        } catch {
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    const fetchBrands = useCallback(async () => {
        try {
            const res = await api.get('/api/fuel-brands');
            setBrands(res.data);
        } catch (err) {
            console.error('Error fetching fuel brands', err);
        }
    }, []);

    useEffect(() => { fetchBrands(); }, [fetchBrands]);

    const saveBrand = async id => {
        const name = editedName.trim();
        if (!name) return alert('Name cannot be empty');
        try {
            await api.put(`/api/fuel-brands/${id}`, { name });
            fetchBrands();
            setEditingId(null);
        } catch (err) { console.error(err); }
    };

    const disableBrand = async id => {
        try {
            await api.patch(`/api/fuel-brands/${id}/disable`);
            setBrands(prev => prev.map(b => b._id === id ? { ...b, isActive: false } : b));
        } catch (err) {
            alert(`Failed to disable fuel brand: ${err.message}`);
            console.error(err);
        }
    };

    const enableBrand = async id => {
        try {
            await api.patch(`/api/fuel-brands/${id}/enable`);
            setBrands(prev => prev.map(b => b._id === id ? { ...b, isActive: true } : b));
        } catch (err) { console.error(err); }
    };

    const addBrand = async () => {
        const name = newName.trim();
        if (!name) return alert('Name is required');
        try {
            await api.post('/api/fuel-brands', { name });
            fetchBrands();
            setNewName('');
        } catch (err) {
            console.error('Error adding fuel brand', err);
        }
    };

    // search, sort & pagination
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState('name');
    const [sortDir, setSortDir] = useState('asc');
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const handleSort = field => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
    };

    const filtered = useMemo(() => {
        const f = search.toLowerCase();
        return brands
            .filter(b => b.name.toLowerCase().includes(f))
            .sort((a, b) => {
                const av = a[sortField], bv = b[sortField];
                if (av < bv) return sortDir === 'asc' ? -1 : 1;
                if (av > bv) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
    }, [brands, search, sortField, sortDir]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const display = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <section className="mt-5">
            <h2>Fuel Brands</h2>
            <div className="row mb-2">
                <div className="col-sm-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search Fuel Brands"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
            </div>
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                            Name {sortField === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th>Active?</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {display.map(brand => (
                        <FuelBrandRow
                            key={brand._id}
                            brand={brand}
                            editingId={editingId}
                            editedName={editedName}
                            onEdit={(id, name) => { setEditingId(id); setEditedName(name); }}
                            onSave={saveBrand}
                            onCancel={() => setEditingId(null)}
                            onDisable={disableBrand}
                            onEnable={enableBrand}
                        />
                    ))}
                    {editingId === null && (
                        <tr>
                            <td>
                                <input
                                    className="form-control form-control-sm"
                                    placeholder="Name"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                />
                            </td>
                            <td />
                            <td>
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={addBrand}
                                    disabled={!newName.trim()}
                                >
                                    Add
                                </button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <PaginationControls current={page} total={totalPages} onPageChange={setPage} />
        </section>
    );
}