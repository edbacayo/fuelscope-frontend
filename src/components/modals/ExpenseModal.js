import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/auth';

const ExpenseModal = ({ show, onClose, vehicleId, onAlert, onExpenseAdded }) => {
    const [type, setType] = useState('fuel');
    const [odometer, setOdometer] = useState('');
    const [totalCost, setTotalCost] = useState('');
    const [fuelBrand, setFuelBrand] = useState('');
    const [pricePerLiter, setPricePerLiter] = useState('');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [duplicateExpense, setDuplicateExpense] = useState(null);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);

    // Dynamic fetch list of fuel brands but fall back to predefined list
    const [fuelBrands, setFuelBrands] = useState([
        'Diesel',
        'Gasoline',
        'Petron Blaze 100 Euro 6 (RON 100+)',
        'Petron XCS (RON 95+)',
        'Petron Xtra Advance (RON 91+)',
        'Petron Turbo Diesel',
        'Petron Diesel Max',
        'Shell V-Power Racing (RON 97+)',
        'Shell V-Power (RON 95+)',
        'Shell FuelSave Unleaded (RON 91+)',
        'Shell V-Power Diesel',
        'Shell FuelSave Diesel',
        'Caltex Gold (RON 95+)',
        'Caltex Silver (RON 91+)',
        'Caltex with Techron (RON 91+)',
        'Caltex Power Diesel with Techron D',
        'Test'
    ]);

    // Fetch fuel brands from backend
    useEffect(() => {
        const fetchFuelBrands = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/fuel-brands`,
                    getAuthHeaders()
                );
                if (response.data && response.data.length > 0) {
                    setFuelBrands(response.data.map(b => b.name));
                    setFuelBrand(response.data[5].name);
                }
            } catch (error) {
                console.warn('⚠️ Falling back to default fuel brands. Error fetching:', error.message);
            }
        };

        if (show) fetchFuelBrands(); // fetch only when modal is open
    }, [show]);

    // ✅ Handle Form Submission with Alert Detection
    const handleSubmit = async (e, forceAdd = false) => {
        e.preventDefault();
        try {
            const expenseData = {
                vehicleId,
                type,
                odometer,
                totalCost,
                fuelDetails: type === 'fuel' ? { fuelBrand, pricePerLiter } : undefined,
                notes,
                date
            };

            if (forceAdd) {
                expenseData.forceAdd = true; // ✅ This flag is used in the backend but NOT stored
            }

            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/expenses`,
                expenseData,
                getAuthHeaders()
            );

            // ✅ Handle Alert if Present
            if (response.data.alert && onAlert) {
                onAlert(response.data.alert);
            }

            // 🚀 Trigger re-fetch of expenses after successful submission
            onExpenseAdded(); // This will re-fetch the expenses in Dashboard and update alerts/reminders
            onClose(); // Close modal after successful submission
        } catch (err) {
            if (err.response && err.response.status === 409) {
                // ✅ Handle duplicate detection properly
                setDuplicateExpense(err.response.data.duplicate);
                setShowDuplicateModal(true);
            } else {
                console.error('Error adding expense:', err);
            }
        }
    };

    if (!show) return null;

    return (
        <>
            {/* Main Expense Modal */}
            <div className="modal show d-block" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Add Expense</h5>
                            <button className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                {/* ✅ Expense Type */}
                                <div className="mb-3">
                                    <label>Type</label>
                                    <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                                        <option value="fuel">Fuel</option>
                                        <option value="insurance">Insurance</option>
                                        <option value="registration">Registration</option>
                                    </select>
                                </div>

                                {/* ✅ Odometer */}
                                <div className="mb-3">
                                    <label>Odometer</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={odometer}
                                        onChange={(e) => setOdometer(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* ✅ Total Cost */}
                                <div className="mb-3">
                                    <label>Total Cost</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={totalCost}
                                        onChange={(e) => setTotalCost(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* ✅ Fuel-specific fields */}
                                {type === 'fuel' && (
                                    <>
                                        {/* Fuel Brand Dropdown */}
                                        <div className="mb-3">
                                            <label>Fuel Brand</label>
                                            <select
                                                className="form-select"
                                                value={fuelBrand}
                                                onChange={(e) => setFuelBrand(e.target.value)}
                                            >
                                                {fuelBrands.map((brand, index) => (
                                                    <option key={index} value={brand}>
                                                        {brand}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Price Per Liter */}
                                        <div className="mb-3">
                                            <label>Price Per Liter</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={pricePerLiter}
                                                onChange={(e) => setPricePerLiter(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                {/* ✅ Notes Field (Optional) */}
                                <div className="mb-3">
                                    <label>Notes (Optional)</label>
                                    <textarea
                                        className="form-control"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows="3"
                                        placeholder="Any additional information about this expense..."
                                    ></textarea>
                                </div>

                                {/* ✅ Date Field with Default Value */}
                                <div className="mb-3">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* ✅ Submit Button */}
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={!odometer || !totalCost || (type === 'fuel' && (!fuelBrand || !pricePerLiter))}
                                >
                                    Add Expense
                                </button>

                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🔄 Duplicate Confirmation Modal (Only Shows When Needed) */}
            {showDuplicateModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Duplicate Expense Found</h5>
                                <button className="btn-close" onClick={() => setShowDuplicateModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>A similar expense already exists:</p>
                                <ul>
                                    <li><strong>Type:</strong> {duplicateExpense.type}</li>
                                    <li><strong>Odometer:</strong> {duplicateExpense.odometer}</li>
                                    <li><strong>Total Cost:</strong> ₱{duplicateExpense.totalCost}</li>
                                    {duplicateExpense.fuelDetails && (
                                        <li><strong>Fuel Brand:</strong> {duplicateExpense.fuelDetails.fuelBrand}</li>
                                    )}
                                    <li><strong>Date:</strong> {new Date(duplicateExpense.date).toLocaleDateString()}</li>
                                </ul>
                                <p>Would you still like to add this expense?</p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowDuplicateModal(false)}>Cancel</button>
                                <button className="btn btn-danger" onClick={() => handleSubmit(new Event('submit'), true)}>Add Anyway</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ExpenseModal;
