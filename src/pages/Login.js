import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('johndoe@example.com');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [website, setWebsite] = useState(''); // honeypot field
    const [isRegister, setIsRegister] = useState(false);
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
                navigate(`/dashboard/${vehicleResponse.data[0]._id}`);
            } else {
                navigate('/no-vehicles');
            }
        } catch (err) {
            console.error('Login failed:', err);
            setError('Invalid email or password. Please try again.');
        }
    };

    // Registration handler
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, { name, email, password, website });
            const { token } = response.data;
            localStorage.setItem('token', token);
            const vehicleResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/vehicles`, { headers: { Authorization: `Bearer ${token}` } });
            if (vehicleResponse.data.length > 0) navigate(`/dashboard/${vehicleResponse.data[0]._id}`);
            else navigate('/no-vehicles');
        } catch (err) {
            console.error('Registration failed:', err);
            setError(`Registration failed. Please try again.`);
        }
    };

    // reset form fields
    const handleClear = () => {
        setName('');
        setEmail('');
        setPassword('');
        setWebsite('');
        setError('');
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center">{isRegister ? 'Register' : 'Login'}</h2>
            <form onSubmit={isRegister ? handleRegister : handleLogin} className="mt-4">
                {isRegister && (
                    <div className="mb-3">
                        <label>Name</label>
                        <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                )}
                <div className="mb-3">
                    <label>Email</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label>Password</label>
                    <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {isRegister && (
                    <input type="text" name="website" autoComplete="off" style={{ display: 'none' }} value={website} onChange={(e) => setWebsite(e.target.value)} />
                )}
                {error && <p className="text-danger">{error}</p>}
                <button type="submit" className="btn btn-primary w-100">{isRegister ? 'Register' : 'Login'}</button>
                <button type="button" className="btn btn-secondary w-100 mt-2" onClick={handleClear}>Clear</button>
            </form>
            <p className="mt-3 text-center">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}
                <button type="button" className="btn btn-link p-0 ms-2" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                    {isRegister ? 'Login' : 'Register'}
                </button>
            </p>
        </div>
    );
};

export default Login;
