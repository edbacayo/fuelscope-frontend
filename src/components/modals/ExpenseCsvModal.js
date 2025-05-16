import React, { useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import { getAuthHeaders } from '../../utils/auth';

const CSV_HEADERS = [
  'type',
  'serviceDetails.serviceType',
  'fuelDetails.fuelBrand',
  'pricePerLiter',
  'liters',
  'recurringInterval',
  'odometer',
  'totalCost',
  'notes',
  'attachmentUrl',
  'isDeleted',
  'date'
];

const ExpenseCsvModal = ({ show, onClose, vehicleId, onImport }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);

  if (!show) return null;

  const handleExport = async () => {
    setExporting(true);
    setError('');
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/vehicles/${vehicleId}/expenses/export`,
        { responseType: 'blob', headers: getAuthHeaders().headers }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expenses-${vehicleId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError('Export failed.');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    setError('');
    setImportSummary(null);
    if (!file) {
      setError('Please select a CSV file');
      return;
    }
    // Pre-validate headers
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const csv = evt.target.result;
      const parsed = Papa.parse(csv, { header: true });
      const headers = parsed.meta.fields;
      const missing = CSV_HEADERS.filter(h => !headers.includes(h));
      if (missing.length > 0) {
        setError(`Invalid CSV headers. Expected: ${CSV_HEADERS.join(', ')}`);
        return;
      }
      // Upload
      const formData = new FormData();
      formData.append('file', file);
      setImporting(true);
      try {
        const res = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/vehicles/${vehicleId}/expenses/import`,
          formData,
          { headers: { ...getAuthHeaders().headers, 'Content-Type': 'multipart/form-data' } }
        );
        setImportSummary(res.data);
        if (onImport) onImport();
      } catch (err) {
        setError(err.response?.data?.error || 'Import failed');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Import/Export Expenses (CSV)</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {importSummary && (
              <div className="alert alert-success">
                Imported {importSummary.importedCount} rows, skipped {importSummary.skippedCount} duplicates.<br />
                {importSummary.errors && importSummary.errors.length > 0 && (
                  <ul>
                    {importSummary.errors.map((e, i) => (
                      <li key={i}>Row {e.row}: {e.message}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <div className="mb-3">
              <label className="form-label">CSV File (for Import)</label>
              <input
                type="file"
                accept=".csv"
                className="form-control"
                onChange={e => { setFile(e.target.files[0]); setError(''); }}
              />
            </div>
            <button className="btn btn-primary me-2" onClick={handleExport} disabled={exporting} type="button">
              {exporting ? 'Exporting...' : 'Export All Expenses'}
            </button>
            <button className="btn btn-success" onClick={handleImport} disabled={importing} type="button">
              {importing ? 'Importing...' : 'Import Expenses'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCsvModal;
