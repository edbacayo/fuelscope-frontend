import React, { useState } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/auth';

const FuellyImportModal = ({ show, onClose, vehicleId, onImport }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [importing, setImporting] = useState(false);

    if (!show) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a CSV file');
            return;
        }
        setImporting(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/import/fuel/${vehicleId}`,
                formData,
                {
                    headers: {
                        ...getAuthHeaders().headers,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            onImport();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Import failed');
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Import from Fuelly</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            <div className="mb-3">
                                <label className="form-label">Fuelly CSV File</label>
                                <input
                                    type="file"
                                    accept=".csv"
                                    className="form-control"
                                    onChange={(e) => { setFile(e.target.files[0]); setError(''); }}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={importing}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={importing}>
                                {importing ? 'Importing…' : 'Import'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FuellyImportModal;
