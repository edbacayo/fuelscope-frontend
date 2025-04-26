import React, { useEffect } from 'react';
import UserSection from './UserSection';
import FuelBrandSection from './FuelBrandSection';
import ServiceTypeSection from './ServiceTypeSection';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.role !== 'admin') {
                navigate('/login', { replace: true });
            }
        } catch {
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    return (
        <div>
            <UserSection />
            <FuelBrandSection />
            <ServiceTypeSection />
        </div>
    );
}