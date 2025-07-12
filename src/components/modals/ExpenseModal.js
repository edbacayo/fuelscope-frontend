import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import validateNumericInput from '../../utils/validateInput';

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
        'Caltex Power Diesel with Techron D'
    ]);

    useEffect(() => {
        const fetchFuelBrands = async () => {
            try {
                const response = await api.get('/api/fuel-brands');
                if (response.data && response.data.length > 0) {
                    setFuelBrands(response.data.filter(b => b.isActive).map(b => b.name));
                    setFuelBrand(response.data[5].name);
                }
            } catch (error) {
                console.warn('Falling back to default fuel brands. Error fetching:', error.message);
            }
        };

        if (show) fetchFuelBrands();
    }, [show]);

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
                expenseData.forceAdd = true; 
            }

            const response = await api.post('/api/expenses', expenseData);

            if (response.data.alert && onAlert) {
                onAlert(response.data.alert);
            }

            onExpenseAdded(); 
            onClose(); 
        } catch (err) {
            if (err.response && err.response.status === 409) {
                // Handle duplicate detection
                setDuplicateExpense(err.response.data.duplicate);
                setShowDuplicateModal(true);
            } else {
                console.error('Error adding expense:', err);
            }
        }
    };

    const handleTotalCostChange = (e) => {
        const value = e.target.value;
        if (validateNumericInput(value)) {
            setTotalCost(value);
        }
    };
    
    const handleOdometerChange = (e) => {
        const value = e.target.value;
        // Odometer should be an integer
        if (validateNumericInput(value, false)) {
            setOdometer(value);
        }
    };
    
    const handlePricePerLiterChange = (e) => {
        const value = e.target.value;
        if (validateNumericInput(value)) {
            setPricePerLiter(value);
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
                                {/* Expense Type */}
                                <div className="mb-3">
                                    <label>Type</label>
                                    <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                                        <option value="fuel">Fuel</option>
                                        <option value="insurance">Insurance</option>
                                        <option value="registration">Registration</option>
                                    </select>
                                </div>

                                {/* Odometer */}
                                {
                                    (type === 'fuel' || type === 'service') && (
                                        <div className="mb-3">
                                            <label>Odometer</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={odometer}
                                                onChange={handleOdometerChange}
                                                required
                                            />
                                        </div>
                                    )
                                }

                                {/* Total Cost */}
                                <div className="mb-3">
                                    <label>Total Cost</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={totalCost}
                                        onChange={handleTotalCostChange}
                                        required
                                    />
                                </div>

                                {/* Fuel-specific fields */}
                                {type === 'fuel' && (
                                    <>
                                        {/* Price Per Liter */}
                                        <div className="mb-3">
                                            <label>Price Per Liter</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={pricePerLiter}
                                                onChange={handlePricePerLiterChange}
                                                required
                                            />
                                        </div>
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
                                    </>
                                )}

                                {/* Notes Field (Optional) */}
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

                                {/* Date Field with Default Value */}
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

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={!totalCost || (type === 'fuel' && (!fuelBrand || !pricePerLiter || !odometer))}
                                >
                                    Add Expense
                                </button>

                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Duplicate Confirmation Modal (Only Shows When Needed) */}
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
