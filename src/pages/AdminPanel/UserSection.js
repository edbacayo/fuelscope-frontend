import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import UserRow from '../../components/AdminPanel/UserRow';
import ResetConfirmationModal from '../../components/modals/ResetConfirmationModal';
import PaginationControls from '../../components/AdminPanel/PaginationControls';

export default function UserSection() {
    const [users, setUsers] = useState([]);
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

    // Reset password modal state
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetTempPassword, setResetTempPassword] = useState('');

    const resetUserPassword = async (id) => {
        try {
            const response = await api.post(`/api/admin/users/${id}/reset-password`);
            setResetTempPassword(response.data.tempPassword);
            setShowResetModal(true);
        } catch (error) {
            alert(error.response?.data?.message || 'Error resetting password');
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

    // Search, sort & pagination states
    const [userSearch, setUserSearch] = useState('');
    const [userSortField, setUserSortField] = useState('name');
    const [userSortDir, setUserSortDir] = useState('asc');
    const [userPage, setUserPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // Sort handlers
    const handleUserSort = field => {
        if (userSortField === field) setUserSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setUserSortField(field); setUserSortDir('asc'); }
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

    return (
        <>
            <ResetConfirmationModal
                show={showResetModal}
                onHide={() => setShowResetModal(false)}
                tempPassword={resetTempPassword}
            />
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
                        <UserRow
                            key={user._id}
                            user={user}
                            onRoleChange={updateUserRole}
                            onDisable={disableUser}
                            onDelete={deleteUser}
                            onReset={resetUserPassword}
                        />
                    ))}
                </tbody>
            </table>
            <PaginationControls current={userPage} total={totalUserPages} onPageChange={setUserPage} />
        </section>
        </>
    );
}