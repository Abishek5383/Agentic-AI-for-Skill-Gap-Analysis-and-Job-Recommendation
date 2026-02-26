import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config';

export default function Login() {
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
            const response = await fetch(API_ENDPOINTS.LOGIN, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    username: email,
                    password: password,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Invalid credentials");
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
            <div className="split-visual">
                <div style={{ position: 'relative', zIndex: 10 }}>
                    <h1 className="hero-title" style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                        CAREER <span className="text-gradient">AGENT</span> AI
                    </h1>
                    <p className="t-h3" style={{ color: 'var(--text-dim)', fontWeight: 300, letterSpacing: '0.1em', maxWidth: '600px', lineHeight: 1.6 }}>
                        Gain the competitive edge. Upload your resume and let our neural network architect your perfect career roadmap and secure high-match opportunities instantly.
                    </p>
                </div>
            </div>

            {/* Form Side */}
            <div className="split-form-container">
                <div style={{ width: '100%', maxWidth: '420px' }}>

                    <div className="mb-8">
                        <h2 className="t-h1 mb-2">ACCESS <span className="text-gradient">PORTAL</span></h2>
                        <p className="t-body" style={{ color: 'var(--text-dim)' }}>Initialize secure neural connection.</p>
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
                            <label htmlFor="password">Password</label>
                            <button
                                type="button"
                                className="input-icon-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? "👁" : "👁‍🗨"}
                            </button>
                        </div>

                        <button type="submit" className="btn-neon w-full flex-center" disabled={loading}>
                            {loading ? "INITIALIZING..." : "LOGIN"}
                        </button>
                    </form>

                    <p className="mt-8 text-center t-small" style={{ color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                        NEW CONSTRUCT? <Link to="/signup" className="text-gradient" style={{ fontWeight: 'bold', textDecoration: 'none', marginLeft: '5px' }}>REGISTER NODE</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
