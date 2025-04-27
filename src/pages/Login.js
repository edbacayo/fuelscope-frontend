import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('johndoe@example.com');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
                email,
                password,
            });

            const { token } = response.data;
            localStorage.setItem('token', token);

            // Fetch user's vehicles after login
            const vehicleResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/vehicles`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (vehicleResponse.data.length > 0) {
                // Redirect to dashboard with the first vehicle
                navigate(`/dashboard/${vehicleResponse.data[0]._id}`);
            } else {
                // Redirect to no-vehicles page if no vehicle exists
                navigate('/no-vehicles');
            }
        } catch (err) {
            console.error('Login failed:', err);
            setError('Invalid email or password. Please try again.');
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center">Login</h2>
            <form onSubmit={handleLogin} className="mt-4">
                <div className="mb-3">
                    <label>Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label>Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="text-danger">{error}</p>}
                <button type="submit" className="btn btn-primary w-100">Login</button>
            </form>
        </div>
    );
};

export default Login;
