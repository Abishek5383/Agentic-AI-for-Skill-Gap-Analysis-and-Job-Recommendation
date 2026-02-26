import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from '../config';

export default function ResumeAnalyzer() {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [resumeData, setResumeData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [jobRole, setJobRole] = useState("Backend Developer");
    const [email, setEmail] = useState("");

    const JOB_ROLES = [
        "Backend Developer",
        "Frontend Developer",
        "Full Stack Developer",
        "Data Scientist",
        "DevOps Engineer",
        "Mobile Developer",
        "Software Engineer"
    ];

    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
        if (token) {
            loadUserProfile();
        }
    }, [user, token]);

    const loadUserProfile = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.PROFILE_ME, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setResumeData({
                    name: data.name,
                    email: data.email,
                    technical_skills: data.technical_skills,
                    soft_skills: data.soft_skills,
                    projects: data.projects,
                    experience: data.experience,
                    job_role: data.job_role
                });
                setJobRole(data.job_role || "Backend Developer");
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            const response = await fetch(API_ENDPOINTS.RESUME_ANALYZE, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData,
            });
            const data = await response.json();
            setResumeData(data);
            if (data.job_role) setJobRole(data.job_role);
            if (data.email) setEmail(data.email);
            setLoading(false);
        } catch (error) {
            alert("Backend error: " + error.message);
            setLoading(false);
        }
    };

    const saveProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_ENDPOINTS.PROFILE_SAVE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: resumeData.name,
                    email: email,
                    technical_skills: resumeData.technical_skills || [],
                    soft_skills: resumeData.soft_skills || [],
                    projects: Array.isArray(resumeData.projects) ? resumeData.projects.join('\n') : resumeData.projects,
                    experience: resumeData.experience,
                    job_role: jobRole,
                    missing_skills: [], // Will be filled on roadmap page
                    roadmap: null, // Will be filled on roadmap page
                }),
            });

            if (!response.ok) throw new Error("Failed to save profile");

            setLoading(false);
            return true;
        } catch (error) {
            alert("Save error: " + error.message);
            setLoading(false);
            return false;
        }
    };

    const handleProceed = async () => {
        const success = await saveProfile();
        if (success) {
            navigate('/roadmap');
        }
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
                <h1 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>RESUME <span className="text-gradient">ANALYZER</span></h1>
                <p className="t-h3" style={{ color: 'var(--text-muted)', fontWeight: 300, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Extract & Edit Skills</p>
            </div>

            {loading && (
                <div className="cyber-card col-span-12 flex-center" style={{ minHeight: '300px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div className="spinner" style={{
                            marginBottom: '2rem',
                            border: '4px solid rgba(255,255,255,0.1)',
                            borderTopColor: 'var(--accent-orange)',
                            borderRadius: '50%',
                            width: 60, height: 60,
                            animation: 'spin 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite'
                        }}></div>
                        <p className="t-h3 text-gradient">PROCESSING...</p>
                    </div>
                </div>
            )}

            {!resumeData && !loading && (
                <div className="cyber-card col-span-12 flex-center flex-col" style={{ padding: '6rem 2rem', borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <div style={{ background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-purple))', padding: '1.5rem', borderRadius: '50%', marginBottom: '2rem', boxShadow: '0 0 40px var(--accent-orange-glow)' }}>
                        <span style={{ fontSize: '2.5rem', color: 'white' }}>⚡</span>
                    </div>
                    <h2 className="t-h2" style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>Upload Your CV/Resume</h2>
                    <p className="t-body mb-6" style={{ color: 'var(--text-muted)' }}>Initialize analysis of your PDF resume credentials.</p>
                    <label className="btn-neon" style={{ cursor: 'pointer' }}>
                        SELECT PDF FILE
                        <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>
                </div>
            )}

            {resumeData && !loading && (
                <>
                    <div className="cyber-card col-span-4">
                        <div className="flex-between mb-6">
                            <h2 className="t-h3" style={{ display: 'flex', alignItems: 'center', gap: '1rem', letterSpacing: '0.1em', margin: 0 }}>
                                <span style={{ width: 8, height: 8, background: 'var(--accent-cyan)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-cyan)' }}></span>
                                PROFILE DETAILS
                            </h2>
                            <button onClick={() => setResumeData(null)} className="btn-neon-outline" style={{ fontSize: '0.7rem', padding: '0.3rem 0.8rem', borderColor: 'var(--text-dim)', color: 'var(--text-dim)' }}>
                                RE-SCAN
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="t-small mb-2" style={{ color: 'var(--text-dim)', letterSpacing: '0.1em' }}>FULL NAME</p>
                            <input type="text" value={resumeData.name || ''} onChange={(e) => setResumeData({ ...resumeData, name: e.target.value })} className="t-h2" style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--text-dim)', color: 'white', width: '100%', outline: 'none', fontSize: '2rem', fontWeight: 'bold', letterSpacing: '0.05em' }} />
                        </div>

                        <div className="mb-6">
                            <p className="t-small mb-2" style={{ color: 'var(--text-dim)', letterSpacing: '0.1em' }}>EMAIL ADDRESS</p>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="cyber-input" />
                        </div>

                        <div className="mb-6">
                            <p className="t-small mb-2" style={{ color: 'var(--text-dim)', letterSpacing: '0.1em' }}>JOB ROLE</p>
                            <select value={jobRole} onChange={(e) => setJobRole(e.target.value)} className="cyber-input" style={{ appearance: 'none' }}>
                                {JOB_ROLES.map(role => <option key={role} value={role} style={{ background: '#000' }}>{role}</option>)}
                            </select>
                        </div>

                        <button onClick={async () => { await saveProfile(); alert("Profile data saved successfully!"); }} className="btn-neon-outline w-full mb-4" style={{ justifyContent: 'center' }}>
                            SAVE PROFILE
                        </button>
                        <button onClick={handleProceed} className="btn-neon w-full" style={{ justifyContent: 'center' }}>
                            PROCEED TO ROADMAP ➔
                        </button>
                    </div>

                    <div className="cyber-card col-span-8">
                        <div className="mb-8">
                            <h2 className="t-h3 mb-4" style={{ letterSpacing: '0.1em', color: 'var(--accent-cyan)' }}>TECHNICAL SKILLS</h2>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                                {resumeData.technical_skills?.map((skill, index) => (
                                    <span key={index} className="badge-tech">{skill}</span>
                                ))}
                                {(!resumeData.technical_skills || resumeData.technical_skills.length === 0) && (
                                    <span className="t-small" style={{ color: 'var(--text-dim)' }}>No technical skills detected.</span>
                                )}
                            </div>
                        </div>

                        <div>
                            <h2 className="t-h3 mb-4" style={{ letterSpacing: '0.1em', color: 'var(--accent-purple)' }}>SOFT SKILLS</h2>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                                {resumeData.soft_skills?.map((skill, index) => (
                                    <span key={index} className="badge-tech" style={{ borderColor: 'var(--accent-purple)', color: '#d8b4fe', background: 'rgba(139, 92, 246, 0.15)', boxShadow: '0 0 10px rgba(139, 92, 246, 0.2)' }}>{skill}</span>
                                ))}
                                {(!resumeData.soft_skills || resumeData.soft_skills.length === 0) && (
                                    <span className="t-small" style={{ color: 'var(--text-dim)' }}>No soft skills detected.</span>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--glass-border)' }}>
                            <p className="t-small mb-4" style={{ color: 'var(--text-dim)', letterSpacing: '0.1em' }}>PROJECTS</p>
                            <textarea
                                value={Array.isArray(resumeData.projects) ? resumeData.projects.join('\n') : resumeData.projects || ''}
                                onChange={(e) => setResumeData({ ...resumeData, projects: e.target.value.split('\n') })}
                                className="prose-inv"
                                style={{ width: '100%', minHeight: '150px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'var(--text-body)', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', resize: 'vertical' }}
                                placeholder="List your key projects here..."
                            />
                        </div>

                        <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--glass-border)' }}>
                            <p className="t-small mb-4" style={{ color: 'var(--text-dim)', letterSpacing: '0.1em' }}>EXPERIENCE</p>
                            <textarea
                                value={resumeData.experience || ''}
                                onChange={(e) => setResumeData({ ...resumeData, experience: e.target.value })}
                                className="prose-inv"
                                style={{ width: '100%', minHeight: '100px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'var(--text-body)', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', resize: 'vertical' }}
                                placeholder="Your experience summary..."
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
