import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import ServiceTypeRow from '../../components/AdminPanel/ServiceTypeRow';
import PaginationControls from '../../components/AdminPanel/PaginationControls';

export default function ServiceTypeSection() {
    const [types, setTypes] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [fields, setFields] = useState({ type: '', odometerInterval: '', timeIntervalMonths: '' });
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

    const fetchTypes = useCallback(async () => {
        try {
            const res = await api.get('/api/service-types');
            setTypes(res.data);
        } catch (err) {
            console.error('Error fetching service types', err);
        }
    }, []);

    useEffect(() => { fetchTypes(); }, [fetchTypes]);

    const saveType = async id => {
        if (!fields.type.trim()) return alert('Type is required');
        try {
            if (id) {
                // Use PUT for update
                try {
                    await api.put(`/api/service-types/${id}`, {
                        type: fields.type,
                        odometerInterval: Number(fields.odometerInterval),
                        timeIntervalMonths: Number(fields.timeIntervalMonths)
                    });
                } catch (err) {
                    const resp = err.response;
                    if (resp && resp.status === 409 && resp.data.needConfirmation) {
                        if (window.confirm(resp.data.message)) {
                            await api.put(`/api/service-types/${id}?force=true`, {
                                type: fields.type,
                                odometerInterval: Number(fields.odometerInterval),
                                timeIntervalMonths: Number(fields.timeIntervalMonths)
                            });
                        } else {
                            return;
                        }
                    } else {
                        throw err;
                    }
                }
            } else {
                // Add new
                await api.post('/api/service-types', {
                    type: fields.type,
                    odometerInterval: Number(fields.odometerInterval),
                    timeIntervalMonths: Number(fields.timeIntervalMonths)
                });
            }
            fetchTypes();
            setEditingId(null);
            setFields({ type: '', odometerInterval: '', timeIntervalMonths: '' });
        } catch (err) {
            console.error(err);
            alert('Failed to save service type.');
        }
    };

    const deleteType = async id => {
        try {
            await api.delete(`/api/service-types/${id}`);
            setTypes(prev => prev.filter(t => t._id !== id));
        } catch (err) {
            const resp = err.response;
            if (resp && resp.status === 409 && resp.data.needConfirmation) {
                if (window.confirm(resp.data.message)) {
                    try {
                        await api.delete(`/api/service-types/${id}?force=true`);
                        setTypes(prev => prev.filter(t => t._id !== id));
                    } catch (e) {
                        console.error(e);
                    }
                }
            } else {
                console.error(err);
            }
        }
    };

    // search, sort & pagination
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState('type');
    const [sortDir, setSortDir] = useState('asc');
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const handleSort = field => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
    };

    const filtered = useMemo(() => {
        const f = search.toLowerCase();
        return types
            .filter(t => t.type.toLowerCase().includes(f))
            .sort((a, b) => {
                const av = a[sortField];
                const bv = b[sortField];
                if (av < bv) return sortDir === 'asc' ? -1 : 1;
                if (av > bv) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
    }, [types, search, sortField, sortDir]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const display = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <section className="mt-5">
            <h2>Service Types</h2>
            <div className="row mb-2">
                <div className="col-sm-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search Service Types"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
            </div>
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('type')}>
                            Type {sortField === 'type' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('odometerInterval')}>
                            Odometer Interval {sortField === 'odometerInterval' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('timeIntervalMonths')}>
                            Time (months) {sortField === 'timeIntervalMonths' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {display.map(t => (
                        <ServiceTypeRow
                            key={t._id}
                            serviceType={t}
                            editingId={editingId}
                            fields={fields}
                            onEdit={(id, svc) => { setEditingId(id); setFields({ type: svc.type, odometerInterval: svc.odometerInterval.toString(), timeIntervalMonths: svc.timeIntervalMonths.toString() }); }}
                            onSave={saveType}
                            onCancel={() => setEditingId(null)}
                            onDelete={deleteType}
                        />
                    ))}
                    {editingId === null && (
                        <tr>
                            <td>
                                <input
                                    className="form-control form-control-sm"
                                    placeholder="Type"
                                    value={fields.type}
                                    onChange={e => setFields(f => ({ ...f, type: e.target.value }))}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    placeholder="Odometer"
                                    value={fields.odometerInterval}
                                    onChange={e => setFields(f => ({ ...f, odometerInterval: e.target.value }))}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    placeholder="Months"
                                    value={fields.timeIntervalMonths}
                                    onChange={e => setFields(f => ({ ...f, timeIntervalMonths: e.target.value }))}
                                />
                            </td>
                            <td>
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => saveType(null)}
                                    disabled={!fields.type.trim()}
                                >Add</button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <PaginationControls current={page} total={totalPages} onPageChange={setPage} />
        </section>
    );
}