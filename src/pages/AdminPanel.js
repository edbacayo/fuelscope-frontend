import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const token = localStorage.getItem('token');

    const fetchUsers = useCallback(async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }, [token]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const updateUserRole = async (id, newRole) => {
        try {
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/admin/users/${id}/role`, { role: newRole }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };

    const disableUser = async (id) => {
        try {
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/admin/users/${id}/disable`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (error) {
            console.error('Error disabling user:', error);
        }
    };

    const deleteUser = async (id) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return (
        <div className="container mt-4">
            <h2>Admin Panel - User Management</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
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
        </div>
    );
};

export default AdminPanel;
