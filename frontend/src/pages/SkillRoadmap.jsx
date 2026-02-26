import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from '../config';

export default function SkillRoadmap() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [resumeData, setResumeData] = useState(null);
    const [roadmapData, setRoadmapData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {
            loadUserProfile();
        }
    }, [token]);

    const loadUserProfile = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.PROFILE_ME, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setResumeData(data);
                if (data.roadmap) {
                    setRoadmapData({
                        job_role: data.job_role,
                        missing_skills: data.missing_skills,
                        learning_roadmap: data.roadmap
                    });
                }
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const generateRoadmap = async () => {
        if (!resumeData || !resumeData.job_role) {
            alert("Please ensure your Job Role is set in the Resume Analyzer first.");
            navigate('/');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(API_ENDPOINTS.ROADMAP_GENERATE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    technical_skills: resumeData.technical_skills || [],
                    job_role: resumeData.job_role,
                }),
            });
            const data = await response.json();
            setRoadmapData(data);

            // Auto-save the generated roadmap to the profile
            await fetch(API_ENDPOINTS.PROFILE_SAVE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...resumeData,
                    job_role: data.job_role,
                    missing_skills: data.missing_skills,
                    roadmap: data.learning_roadmap,
                }),
            });

            setLoading(false);
        } catch (error) {
            alert("Roadmap error: " + error.message);
            setLoading(false);
        }
    };

    const getSkillLogo = (skill) => {
        const slug = skill.toLowerCase().replace(/[^a-z0-9]/g, '');
        return `https://cdn.simpleicons.org/${slug}/ff6b00`;
    };

    const handleMouseMove = (e) => {
        const cards = document.getElementsByClassName("cyber-card");
        for (const card of cards) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        }
    };

    return (
        <div className="grid-cyber" onMouseMove={handleMouseMove}>
            <div className="col-span-12" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>SKILL <span className="text-gradient">ROADMAP</span></h1>
                <p className="t-h3" style={{ color: 'var(--text-muted)', fontWeight: 300, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{resumeData?.job_role || 'No Role Selected'}</p>
            </div>

            {loading && (
                <div className="cyber-card col-span-12 flex-center" style={{ minHeight: '300px' }}>
                    <div className="spinner" style={{
                        border: '4px solid rgba(255,255,255,0.1)',
                        borderTopColor: 'var(--accent-orange)',
                        borderRadius: '50%',
                        width: 60, height: 60,
                        animation: 'spin 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite'
                    }}></div>
                </div>
            )}

            {!roadmapData && !loading && (
                <div className="cyber-card col-span-12 flex-center flex-col" style={{ padding: '6rem 2rem', borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <h2 className="t-h2 mb-4">No Roadmap Generated Yet</h2>
                    <p className="t-body mb-6" style={{ color: 'var(--text-muted)' }}>Generate a learning path based on your uploaded resume and selected job role.</p>
                    <button onClick={generateRoadmap} className="btn-neon">
                        GENERATE ROADMAP NOW
                    </button>
                </div>
            )}

            {roadmapData && !loading && (
                <div className="col-span-12">
                    {/* Missing Skills */}
                    <div className="cyber-card mb-6" style={{ borderColor: 'var(--accent-orange)', background: 'rgba(255, 85, 0, 0.05)' }}>
                        <div className="flex-between">
                            <div>
                                <h3 className="t-h3" style={{ color: 'var(--accent-orange)', marginBottom: '0.5rem' }}>MISSING SKILLS</h3>
                                <p className="t-body" style={{ opacity: 0.8 }}>Recommended skills to acquire for {roadmapData.job_role}.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '50%' }}>
                                {roadmapData.missing_skills?.map((skill, index) => (
                                    <span key={index} className="badge-tech" style={{ borderColor: 'var(--accent-orange)', color: 'white' }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                        <button onClick={generateRoadmap} className="btn-neon-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                            REGENERATE ROADMAP
                        </button>
                    </div>

                    {/* Roadmap Grid */}
                    <div className="grid-cyber">
                        {roadmapData.learning_roadmap && Object.entries(roadmapData.learning_roadmap).map(([skill, info], index) => (
                            <div key={skill} className="cyber-card col-span-6 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                                    <div style={{
                                        width: 64, height: 64,
                                        borderRadius: '16px',
                                        background: 'rgba(255,255,255,0.03)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '1px solid var(--glass-border)',
                                        boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                                    }}>
                                        <img
                                            src={getSkillLogo(skill)}
                                            alt={skill}
                                            style={{ width: 32, height: 32, objectFit: 'contain', filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.5))' }}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="t-h2" style={{ textTransform: 'uppercase', marginBottom: '0.2rem' }}>{skill}</h3>
                                        <p className="t-small" style={{ color: 'var(--accent-cyan)' }}>LEVEL {index + 1}</p>
                                    </div>
                                </div>

                                <div className="mb-6" style={{ position: 'relative' }}>
                                    <div className="path-line"></div>
                                    <ul style={{ listStyle: 'none', paddingLeft: 0, position: 'relative', zIndex: 1 }}>
                                        {info.roadmap.map((step, i) => (
                                            <li key={i} style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'start', gap: '1rem' }}>
                                                <span style={{
                                                    background: 'var(--bg-deep)',
                                                    border: '1px solid var(--accent-orange)',
                                                    color: 'var(--accent-orange)',
                                                    minWidth: '24px', height: '24px',
                                                    borderRadius: '50%',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 'bold', fontSize: '0.75rem',
                                                    marginTop: '2px',
                                                    boxShadow: '0 0 10px var(--accent-orange-glow)'
                                                }}>{i + 1}</span>
                                                <span className="t-body" style={{ fontSize: '1rem', color: '#e2e8f0' }}>{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="t-small mb-4" style={{ fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-dim)' }}>DATA SOURCES</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        {info.websites && info.websites.map((link, i) => (
                                            <a key={i} href={link} target="_blank" rel="noreferrer" className="btn-neon-outline" style={{ padding: '0.8rem 1rem', fontSize: '0.9rem', justifyContent: 'flex-start' }}>
                                                <span style={{ marginRight: '0.5rem' }}>📄</span> {new URL(link).hostname}
                                            </a>
                                        ))}
                                        {info.youtube && info.youtube.map((link, i) => {
                                            const parts = link.split(" - ");
                                            const title = parts[1] || "Watch Tutorial";
                                            return (
                                                <a key={i} href={parts[0]} target="_blank" rel="noreferrer" className="btn-neon-outline" style={{ padding: '0.8rem 1rem', fontSize: '0.9rem', justifyContent: 'flex-start', borderColor: 'rgba(220, 38, 38, 0.4)', color: '#fca5a5' }}>
                                                    <span style={{ marginRight: '0.5rem' }}>▶</span> {title}
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
                        <button onClick={() => navigate('/jobs')} className="btn-neon" style={{ padding: '1rem 3rem' }}>
                            PROCEED TO JOB PORTAL ➔
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
