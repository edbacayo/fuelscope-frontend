import React from 'react';

export default function FuelBrandRow({ brand, editingId, editedName, onEdit, onSave, onCancel, onDisable, onEnable }) {
    const isEditing = editingId === brand._id;
    return (
        <tr>
            <td>
                {isEditing ? (
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        value={editedName}
                        onChange={e => onEdit(brand._id, e.target.value)}
                    />
                ) : brand.name}
            </td>
            <td>
                <input type="checkbox" checked={brand.isActive} disabled />
            </td>
            <td>
                {isEditing ? (
                    <>
                        <button
                            className="btn btn-sm btn-success me-1"
                            onClick={() => onSave(brand._id)}
                            disabled={editedName.trim() === ''}
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
                            onClick={() => onEdit(brand._id, brand.name)}
                        >
                            Edit
                        </button>
                        <button
                            className="btn btn-sm btn-outline-danger me-1"
                            onClick={() => onDisable(brand._id)}
                            disabled={!brand.isActive}
                        >
                            Disable
                        </button>
                        <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => onEnable(brand._id)}
                            disabled={brand.isActive}
                        >
                            Enable
                        </button>
                    </>
                )}
            </td>
        </tr>
    );
}