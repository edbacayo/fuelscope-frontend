import React, { useState, useEffect } from 'react';
import axios from 'axios';


// 🔧 Global Service Types List (Admin-Managed) with Default Reminders
const globalServiceTypes = [
    { type: 'Oil and Oil Filter Change', odometerInterval: 5000, timeIntervalMonths: 6 },
    { type: 'Preventive Maintenance Service (PMS)', odometerInterval: 10000, timeIntervalMonths: 6 },
    { type: 'Tire Rotation', odometerInterval: 10000, timeIntervalMonths: 12 },
    { type: 'Brake Inspection', odometerInterval: 10000, timeIntervalMonths: 12 },
    { type: 'Cabin Air Filter Replacement', odometerInterval: 15000, timeIntervalMonths: 12 },
    { type: 'Air Filter Replacement', odometerInterval: 15000, timeIntervalMonths: 12 },
    { type: 'Brake Fluid Replacement', odometerInterval: 30000, timeIntervalMonths: 24 },
    { type: 'Transmission Fluid Change', odometerInterval: 60000, timeIntervalMonths: 48 },
    { type: 'Coolant Flush', odometerInterval: 50000, timeIntervalMonths: 24 },
    { type: 'Spark Plug Replacement', odometerInterval: 30000, timeIntervalMonths: 24 },
    { type: 'Timing Belt Replacement', odometerInterval: 100000, timeIntervalMonths: 60 },
    { type: 'Battery Replacement', odometerInterval: 50000, timeIntervalMonths: 36 },
    { type: 'Waxing', odometerInterval: 0, timeIntervalMonths: 6 }
];


const ServiceModal = ({ show, onClose, vehicleId, onExpenseAdded, onAlert }) => {
    const [serviceType, setServiceType] = useState(globalServiceTypes[0].type);
    const [odometer, setOdometer] = useState('24001');
    const [totalCost, setTotalCost] = useState('200');
    const [notes, setNotes] = useState('');
    const [enableReminder, setEnableReminder] = useState(true); // ✅ Reminder toggle
    const [customOdometerInterval, setCustomOdometerInterval] = useState(0);
    const [customTimeInterval, setCustomTimeInterval] = useState(0);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const getDefaultReminder = (type) => {
        const service = globalServiceTypes.find((s) => s.type === type);
        return {
            odometerInterval: service ? service.odometerInterval : 0,
            timeIntervalMonths: service ? service.timeIntervalMonths : 0
        };
    };

    // Auto-fill intervals when service type changes
    useEffect(() => {
        const { odometerInterval, timeIntervalMonths } = getDefaultReminder(serviceType);
        setCustomOdometerInterval(odometerInterval);
        setCustomTimeInterval(timeIntervalMonths);
    }, [serviceType]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
    
            // Use user-modified values from the state
            const odometerInterval = customOdometerInterval;
            const timeIntervalMonths = customTimeInterval;
    
            // 📥 Prepare the reminder payload only if reminders are enabled
            let reminderToSend = null;
    
            if (enableReminder) {
                reminderToSend = {
                    type: serviceType,
                    odometerInterval, // Use the modified value
                    timeIntervalMonths, // Use the modified value
                    lastServiceDate: new Date(),
                    lastServiceOdometer: odometer,
                    isEnabled: true
                };
            }
    
            // 📤 Send the service entry with the relevant reminder only
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/expenses`,
                {
                    vehicleId,
                    type: 'service',
                    serviceDetails: { serviceType },
                    odometer,
                    totalCost,
                    notes,
                    date,
                    reminderToSend: reminderToSend // ✅ Only send the modified reminder
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // ✅ Handle Alert if Present
            if (response.data.serviceAlerts && onAlert) {
                onAlert(response.data.serviceAlerts);
            }
    
            // 🚀 Trigger re-fetch of expenses after successful submission
            onExpenseAdded(); // This will re-fetch the expenses in Dashboard and update alerts/reminders
            onClose(); // Close modal after submission
        } catch (err) {
            console.error('Error adding service:', err);
        }
    };
    


    if (!show) return null;

    return (
        <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Add Service Entry</h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            {/* Service Type */}
                            <div className="mb-3">
                                <label>Service Type</label>
                                <select
                                    className="form-select"
                                    value={serviceType}
                                    onChange={(e) => setServiceType(e.target.value)}
                                    required
                                >
                                    {globalServiceTypes.map((service) => (
                                        <option key={service.type} value={service.type}>
                                            {service.type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Odometer Input */}
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

                            {/* Total Cost */}
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

                            {/* Enable Reminder */}
                            <div className="form-check mb-3">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={enableReminder}
                                    onChange={() => setEnableReminder(!enableReminder)}
                                />
                                <label className="form-check-label">Enable Reminder</label>
                            </div>

                            {/* Custom Reminder Options */}
                            {enableReminder && (
                                <>
                                    <div className="mb-3">
                                        <label>Custom Odometer Interval (km)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Default will be used if left empty"
                                            value={customOdometerInterval}
                                            onChange={(e) => setCustomOdometerInterval(e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label>Custom Time Interval (months)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Default will be used if left empty"
                                            value={customTimeInterval}
                                            onChange={(e) => setCustomTimeInterval(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Notes */}
                            <div className="mb-3">
                                <label>Notes (Optional)</label>
                                <textarea
                                    className="form-control"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows="3"
                                />
                            </div>

                            {/* Date */}
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

                            <button type="submit" className="btn btn-success w-100">Add Service</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceModal;
