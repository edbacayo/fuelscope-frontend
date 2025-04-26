import React from 'react';

export default function ServiceTypeRow({ serviceType, editingId, fields, onEdit, onSave, onCancel, onDelete }) {
  const isEditing = editingId === serviceType._id;
  return (
    <tr>
      <td>
        {isEditing ? (
          <input
            type="text"
            className="form-control form-control-sm"
            value={fields.type}
            onChange={e => onEdit(serviceType._id, { ...fields, type: e.target.value })}
          />
        ) : (
          serviceType.type
        )}
      </td>
      <td>
        {isEditing ? (
          <input
            type="number"
            className="form-control form-control-sm"
            value={fields.odometerInterval}
            onChange={e => onEdit(serviceType._id, { ...fields, odometerInterval: e.target.value })}
          />
        ) : (
          serviceType.odometerInterval
        )}
      </td>
      <td>
        {isEditing ? (
          <input
            type="number"
            className="form-control form-control-sm"
            value={fields.timeIntervalMonths}
            onChange={e => onEdit(serviceType._id, { ...fields, timeIntervalMonths: e.target.value })}
          />
        ) : (
          serviceType.timeIntervalMonths
        )}
      </td>
      <td>
        {isEditing ? (
          <>
            <button
              className="btn btn-sm btn-success me-1"
              onClick={() => onSave(serviceType._id)}
              disabled={!fields.type.trim()}
            >
              Save
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn-sm btn-outline-primary me-1"
              onClick={() => onEdit(serviceType._id, { ...serviceType, odometerInterval: serviceType.odometerInterval.toString(), timeIntervalMonths: serviceType.timeIntervalMonths.toString() })}
            >
              Edit
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(serviceType._id)}
            >
              Delete
            </button>
          </>
        )}
      </td>
    </tr>
  );
}