import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGasPump,
    faWrench,
    faShieldAlt,
    faCar,
} from '@fortawesome/free-solid-svg-icons'; // ✅ Import FontAwesome icons

const SummaryCard = ({ title, value, type }) => {
    // 🎨 Define colors based on the summary type
    const getCardColor = () => {
        switch (type) {
            case 'fuel':
                return 'bg-primary text-white';
            case 'service':
                return 'bg-warning text-dark';
            case 'insurance':
                return 'bg-info text-white';
            case 'registration':
                return 'bg-success text-white';
            default:
                return 'bg-light text-dark';
        }
    };

    // 🚗 Define icons based on the summary type
    const getIcon = () => {
        switch (type) {
            case 'fuel':
                return faGasPump;
            case 'service':
                return faWrench;
            case 'insurance':
                return faShieldAlt;
            case 'registration':
                return faCar;
            default:
                return faCar;
        }
    };

    // 💰 Format currency with fallback
    const formatCurrency = (amount) => {
        const numericValue = parseFloat(amount);
        if (isNaN(numericValue)) return '₱0.00'; // ✅ Handle invalid values
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(numericValue);
    };

    return (
        <div className="col-12 col-md-6 col-lg-3 mb-4">
            <div className={`card shadow-sm p-3 ${getCardColor()}`}>
                <div className="d-flex align-items-center">
                    {/* 🔥 Icon */}
                    <FontAwesomeIcon icon={getIcon()} size="2x" className="me-3" />
                    <div>
                        <h5 className="card-title">{title}</h5>
                        <p className="card-text display-6">{formatCurrency(value)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryCard;
