import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(API_ENDPOINTS.REGISTER, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Registration failed. Ensure password is >8 chars.");
            }

            const data = await response.json();
            login(data.access_token);
            navigate('/');
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="split-layout animate-fade-in">
            {/* Visual Side */}
            <div className="split-visual" style={{
                background: "radial-gradient(circle at center, rgba(34, 211, 238, 0.2), #0f172a 70%), url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat"
            }}>
                <div style={{ position: 'relative', zIndex: 10 }}>
                    <h1 className="hero-title" style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                        INITIALIZE <span className="text-gradient">PROFILE</span>
                    </h1>
                    <p className="t-h3" style={{ color: 'var(--text-dim)', fontWeight: 300, letterSpacing: '0.1em', maxWidth: '600px', lineHeight: 1.6 }}>
                        Join the grid. Our AI actively scans the market to match your unique neural footprint with the perfect career opportunities.
                    </p>
                </div>
            </div>

            {/* Form Side */}
            <div className="split-form-container">
                <div style={{ width: '100%', maxWidth: '420px' }}>

                    <div className="mb-8">
                        <h2 className="t-h1 mb-2">CREATE <span className="text-gradient" style={{ background: 'linear-gradient(to right, var(--accent-cyan), var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NODE</span></h2>
                        <p className="t-body" style={{ color: 'var(--text-dim)' }}>Register your details to deploy your agent.</p>
                    </div>

                    {error && (
                        <div className="toast-error">
                            <span style={{ marginRight: '8px' }}>⚠</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder=" "
                                required
                            />
                            <label htmlFor="email">Email Address</label>
                        </div>

                        <div className="input-group" style={{ marginBottom: '2.5rem' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder=" "
                                required
                            />
                            <label htmlFor="password">Secure Password (Min 8 chars)</label>
                            <button
                                type="button"
                                className="input-icon-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? "👁" : "👁‍🗨"}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="btn-neon w-full flex-center"
                            disabled={loading}
                            style={{ background: 'var(--accent-cyan)', color: 'black', boxShadow: '0 0 20px rgba(34,211,238,0.4)' }}
                        >
                            {loading ? "INITIALIZING..." : "REGISTER ACCOUNT"}
                        </button>
                    </form>

                    <p className="mt-8 text-center t-small" style={{ color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                        ALREADY ACTIVE? <Link to="/login" className="text-gradient" style={{ fontWeight: 'bold', textDecoration: 'none', marginLeft: '5px' }}>ACCESS PORTAL</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
