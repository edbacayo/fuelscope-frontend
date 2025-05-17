import React from 'react';

export default function UserRow({ user, onRoleChange, onDisable, onDelete, onReset }) {
  return (
    <tr>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>
        <select
          className="form-select"
          value={user.role}
          onChange={e => onRoleChange(user._id, e.target.value)}
        >
          <option value="user">User</option>
          <option value="premium">Premium</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td>{user.disabled ? 'Disabled' : 'Active'}</td>
      <td>
        {!user.disabled && (
          <button
            className="btn btn-warning btn-sm me-1"
            onClick={() => onDisable(user._id)}
          >
            Disable
          </button>
        )}
        <button
          className="btn btn-info btn-sm me-1"
          onClick={() => onReset(user._id)}
        >
          Reset Password
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(user._id)}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}