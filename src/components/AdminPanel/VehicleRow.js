import React from 'react';

export default function VehicleRow({ vehicle, onDelete }) {
  // Format the date nicely if it exists
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <tr>
      <td>{vehicle.userName || 'Unknown'}</td>
      <td>{vehicle.name}</td>
      <td>{vehicle.expenseCount || 0}</td>
      <td>{formatDate(vehicle.lastExpenseDate)}</td>
      <td>
        <button
          className="btn btn-danger btn-sm"
          onClick={onDelete}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
