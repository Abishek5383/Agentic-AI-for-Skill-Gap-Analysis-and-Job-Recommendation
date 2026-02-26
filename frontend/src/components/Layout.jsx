import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const getNavStyle = (path) => {
        const isActive = location.pathname === path;
        return {
            color: isActive ? '#000' : 'var(--text-body)',
            letterSpacing: '0.1em',
            background: isActive ? 'var(--accent-orange)' : 'none',
            border: isActive ? '1px solid var(--accent-orange)' : 'none',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontWeight: isActive ? 'bold' : 'normal',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        };
    };

    return (
        <div className="container-fluid animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 2rem',
                borderBottom: '1px solid var(--glass-border)',
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                <div
                    onClick={() => navigate('/')}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>CAREER <span className="text-gradient">AGENT</span></span>
                    <span className="badge-tech" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderColor: 'var(--text-dim)', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>v1.0.0</span>
                </div>

                <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <button onClick={() => navigate('/')} className="t-small" style={getNavStyle('/')}>RESUME ANALYZER</button>
                    <button onClick={() => navigate('/roadmap')} className="t-small" style={getNavStyle('/roadmap')}>SKILL ROADMAP</button>
                    <button onClick={() => navigate('/jobs')} className="t-small" style={getNavStyle('/jobs')}>JOB PORTAL</button>
                </nav>

                <button
                    onClick={logout}
                    className="btn-neon-outline"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                >
                    DISCONNECT
                </button>
            </header>

            <main style={{ flex: 1, padding: '2rem 0' }}>
                <Outlet />
            </main>
        </div>
    );
}
