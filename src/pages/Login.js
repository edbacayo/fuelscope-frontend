import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DisclaimerModal from "../components/modals/DisclaimerModal";
import api from "../utils/api";
import { useErrorHandler } from "../utils/errorHandler";

const Login = () => {
    useEffect(() => {
        api.get("/api/ping").catch(() => {});
    }, []);
    const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
    const [disclaimerChecked, setDisclaimerChecked] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [name, setName] = useState("");
    const [website, setWebsite] = useState(""); 
    const [isRegister, setIsRegister] = useState(false);
    const navigate = useNavigate();
    const { handleError } = useErrorHandler();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(`/api/auth/login`, {
                email,
                password,
            });

            const { token } = response.data;
            localStorage.setItem("token", token);

            let mustReset = false;
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                if (payload.mustResetPassword) {
                    mustReset = true;
                    localStorage.setItem("mustResetPassword", "true");
                    window.dispatchEvent(new Event("mustResetPassword"));
                } else {
                    localStorage.removeItem("mustResetPassword");
                }
            } catch {
                localStorage.removeItem("mustResetPassword");
            }

            if (mustReset) {
                navigate("/"); 
                return;
            }

            const vehicleResponse = await api.get(`/api/vehicles`);

            if (vehicleResponse.data.length > 0) {
                navigate(`/dashboard/${vehicleResponse.data[0]._id}`);
            } else {
                navigate("/no-vehicles");
            }
        } catch (err) {
            handleError(err, 'Login failed');
            setError("Invalid email or password. Please try again.");
        }
    };

    // Registration handler
    const handleRegister = async (e) => {
        e.preventDefault();
        if (!disclaimerChecked) {
            setError("You must agree to the Disclaimer before registering.");
            return;
        }
        try {
            const agreedToDisclaimerAt = new Date().toISOString(); 
            const response = await api.post(`/api/auth/register`, {
                name,
                email,
                password,
                website,
                agreedToDisclaimerAt,
            });
            const { token } = response.data;
            localStorage.setItem("token", token);
            const vehicleResponse = await api.get(`/api/vehicles`);
            if (vehicleResponse.data.length > 0)
                navigate(`/dashboard/${vehicleResponse.data[0]._id}`);
            else navigate("/no-vehicles");
        } catch (err) {
            handleError(err, 'Registration failed');
            setError(`Registration failed. Please try again.`);
        } 
    };

    const handleClear = () => {
        setName("");
        setEmail("");
        setPassword("");
        setWebsite("");
        setError("");
        setDisclaimerChecked(false);
    };

    return (
        <div className="container mt-5 d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <div className="card shadow" style={{ width: "100%", maxWidth: "500px" }}>
                <div className="card-body p-4">
                    <h2 className="text-center mb-4">{isRegister ? "Register" : "Login"}</h2>
                    <form onSubmit={isRegister ? handleRegister : handleLogin}>
                {isRegister && (
                    <div className="mb-3">
                        <label>Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                )}
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
                {isRegister && (
                    <input
                        type="text"
                        name="website"
                        autoComplete="off"
                        style={{ display: "none" }}
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                    />
                )}
                {/* Disclaimer Agreement Checkbox */}
                {isRegister && (
                    <div className="mb-3 form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="disclaimerCheck"
                            checked={disclaimerChecked}
                            onChange={(e) => setDisclaimerChecked(e.target.checked)}
                            required
                        />
                        <label className="form-check-label" htmlFor="disclaimerCheck">
                            I have read and agree to the{" "}
                            <button
                                type="button"
                                className="btn btn-link p-0 align-baseline"
                                style={{ fontSize: "inherit" }}
                                onClick={() => setShowDisclaimerModal(true)}
                            >
                                Disclaimer
                            </button>
                            .
                        </label>
                    </div>
                )}
                {error && <p className="text-danger">{error}</p>}
                <button
                    type="submit"
                    className="btn btn-primary mt-3 w-100"
                    disabled={(isRegister && !disclaimerChecked)}
                >
                    {isRegister ? "Register" : "Login"}
                </button>
                <button
                    type="button"
                    className="btn btn-secondary w-100 mt-2"
                    onClick={handleClear}
                >
                    Clear
                </button>
                <DisclaimerModal
                    show={showDisclaimerModal}
                    onHide={() => setShowDisclaimerModal(false)}
                />
                    </form>
                    <p className="mt-3 text-center">
                        {isRegister ? "Already have an account?" : "Don't have an account?"}
                        <button
                            type="button"
                            className="btn btn-link p-0 ms-2"
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError("");
                            }}
                        >
                            {isRegister ? "Login" : "Register"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
