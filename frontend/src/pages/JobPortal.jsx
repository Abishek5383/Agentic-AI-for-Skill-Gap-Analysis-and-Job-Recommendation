import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_ENDPOINTS } from '../config';

export default function JobPortal() {
    const { token } = useAuth();
    const [profileId, setProfileId] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [selectedJobs, setSelectedJobs] = useState([]);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [appliedJobsHistory, setAppliedJobsHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {
            loadUserProfileAndJobs();
            loadAppliedJobs();
        }
    }, [token]);

    const loadUserProfileAndJobs = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.PROFILE_ME, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const pid = data._id || data.id;

                if (pid) {
                    setProfileId(pid);
                    await fetchMatchedJobs(pid);
                }
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMatchedJobs = async (id) => {
        try {
            const jobsRes = await fetch(API_ENDPOINTS.JOBS_MATCHED(id), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (jobsRes.ok) {
                const jobsData = await jobsRes.json();
                if (Array.isArray(jobsData)) setJobs(jobsData);
            }
        } catch (e) {
            console.error("Error fetching jobs:", e);
        }
    };

    const refreshJobs = async () => {
        if (profileId) {
            setLoading(true);
            await fetchMatchedJobs(profileId);
            setLoading(false);
        } else {
            alert("Please save your profile in the Resume Analyzer first.");
        }
    };

    const loadAppliedJobs = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.APPLY_STATUS, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            setAppliedJobsHistory(data.applications || []);

            // Update local state for applied jobs based on history
            if (data.applications) {
                const historyIds = data.applications.map(app => app.job_id);
                setAppliedJobs(prev => [...new Set([...prev, ...historyIds])]);
            }
        } catch (error) {
            console.error("Error loading applied jobs:", error);
        }
    };

    const toggleJobSelection = (jobId) => {
        setSelectedJobs((prev) => {
            if (prev.includes(jobId)) {
                return prev.filter((id) => id !== jobId);
            } else {
                return [...prev, jobId];
            }
        });
    };

    const applyToSelected = async () => {
        if (selectedJobs.length === 0) {
            alert("Please select at least one job");
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.APPLY, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    profile_id: profileId,
                    job_ids: selectedJobs,
                }),
            });
            const data = await response.json();

            setAppliedJobs((prev) => [...prev, ...selectedJobs]);
            setSelectedJobs([]);

            alert("Successfully applied to " + data.applied_count + " jobs!");
            loadAppliedJobs();
        } catch (error) {
            alert("Application error: " + error.message);
        }
    };

    const applyToAll = async () => {
        const unappliedJobs = jobs.filter(j => !appliedJobs.includes(j.id)).map(j => j.id);
        if (unappliedJobs.length === 0) {
            alert("Already applied to all visible jobs!");
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.APPLY, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    profile_id: profileId,
                    job_ids: unappliedJobs,
                }),
            });
            const data = await response.json();

            setAppliedJobs(prev => [...prev, ...unappliedJobs]);
            setSelectedJobs([]);

            alert("Successfully applied to all " + data.applied_count + " new jobs!");
            loadAppliedJobs();
        } catch (error) {
            alert("Application error: " + error.message);
        }
    };

    const handleApply = async (job) => {
        // 1. Direct Apply (Redirect)
        if (job.apply_link) {
            try {
                await fetch(API_ENDPOINTS.APPLY, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        profile_id: profileId,
                        job_ids: [job.id],
                    }),
                });

                setAppliedJobs((prev) => [...prev, job.id]);
                loadAppliedJobs();

                window.open(job.apply_link, "_blank");

            } catch (error) {
                console.error("Tracking error:", error);
                window.open(job.apply_link, "_blank");
            }
            return;
        }

        // 2. Email Fallback
        const companyEmail = prompt("Enter company email address (if available):");
        if (!companyEmail) {
            alert("Email address required");
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.APPLY_EMAIL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    profile_id: profileId,
                    job_id: job.id,
                    company_email: companyEmail,
                    job_title: job.title,
                    company_name: job.company
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert("Application email sent successfully!");
                setAppliedJobs((prev) => [...prev, job.id]);
                loadAppliedJobs();
            } else {
                alert("Failed to send email: " + data.message);
            }
        } catch (error) {
            alert("Error: " + error.message);
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
                <h1 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>JOB <span className="text-gradient">PORTAL</span></h1>
                <p className="t-h3" style={{ color: 'var(--text-muted)', fontWeight: 300, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Available Opportunities</p>
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

            {/* Jobs Section */}
            {!loading && jobs.length === 0 && (
                <div className="cyber-card col-span-12 flex-center flex-col" style={{ padding: '6rem 2rem', borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <h2 className="t-h2 mb-4">No Jobs Found</h2>
                    <p className="t-body mb-6" style={{ color: 'var(--text-muted)' }}>We couldn't find any matches at this time. Make sure your profile has skills selected.</p>
                    <button onClick={refreshJobs} className="btn-neon-outline">
                        REFRESH JOBS
                    </button>
                </div>
            )}

            {!loading && jobs.length > 0 && (
                <div className="col-span-12 animate-fade-in" style={{ marginTop: '2rem' }}>
                    <div className="flex-between mb-8">
                        <h2 className="t-h1">MATCHES <span style={{ fontSize: '1.5rem', color: 'var(--text-dim)', verticalAlign: 'middle' }}>// {jobs.length} FOUND</span></h2>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={refreshJobs}
                                className="btn-neon-outline"
                                style={{ padding: '0.5rem 1rem' }}
                            >
                                REFRESH
                            </button>

                            <button
                                onClick={applyToSelected}
                                disabled={selectedJobs.length === 0}
                                className="btn-neon-outline"
                                style={{ opacity: selectedJobs.length === 0 ? 0.3 : 1 }}
                            >
                                APPLY TO SELECTED ({selectedJobs.length})
                            </button>

                            <button onClick={applyToAll} className="btn-neon">
                                APPLY TO ALL 🚀
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
                        {jobs.map((job) => {
                            const isSelected = selectedJobs.includes(job.id);
                            const isApplied = appliedJobs.includes(job.id);

                            return (
                                <div key={job.id}
                                    className="cyber-card"
                                    onClick={() => !isApplied && toggleJobSelection(job.id)}
                                    style={{
                                        border: isSelected ? "1px solid var(--accent-orange)" : "1px solid var(--glass-border)",
                                        background: isSelected ? "rgba(255, 85, 0, 0.05)" : "var(--bg-card)",
                                        boxShadow: isSelected ? "0 0 30px rgba(255,85,0,0.15)" : "none",
                                        padding: 0,
                                        cursor: isApplied ? 'default' : 'pointer',
                                        transform: isSelected ? 'translateY(-5px)' : 'none'
                                    }}
                                >
                                    <div style={{ padding: '2rem' }}>
                                        <div className="flex-between mb-4">
                                            <div className="badge-tech" style={{ color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)' }}>
                                                {new Date(job.posted_date).toLocaleDateString()}
                                            </div>

                                            {/* Match Percentage Badge */}
                                            {job.match_percentage > 0 && (
                                                <div className="badge-tech" style={{
                                                    background: job.match_percentage > 70 ? 'rgba(74, 222, 128, 0.2)' : 'rgba(250, 204, 21, 0.2)',
                                                    borderColor: job.match_percentage > 70 ? '#4ade80' : '#facc15',
                                                    color: job.match_percentage > 70 ? '#4ade80' : '#facc15',
                                                    marginLeft: 'auto', marginRight: '1rem'
                                                }}>
                                                    {job.match_percentage}% MATCH
                                                </div>
                                            )}

                                            {!isApplied && (
                                                <div style={{
                                                    width: 24, height: 24,
                                                    borderRadius: '50%',
                                                    border: isSelected ? '6px solid var(--accent-orange)' : '2px solid var(--text-dim)',
                                                    transition: 'all 0.2s',
                                                    boxShadow: isSelected ? '0 0 10px var(--accent-orange)' : 'none'
                                                }}></div>
                                            )}
                                            {isApplied && <span className="badge-tech" style={{ background: 'var(--accent-cyan)', color: 'black', fontWeight: 'bold' }}>APPLIED</span>}
                                        </div>

                                        <h3 className="t-h2 mb-2" style={{ fontSize: '1.5rem' }}>{job.title}</h3>
                                        <p className="t-body mb-6" style={{ fontWeight: 500, color: 'white' }}>{job.company}</p>

                                        <div className="flex-between mb-6" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>📍 {job.location || 'Remote'}</span>
                                            <span style={{ fontWeight: 600, color: '#4ade80' }}>{job.salary}</span>
                                        </div>

                                        {/* Explicit Skill Analysis Section */}
                                        {job.matching_skills && job.matching_skills.length > 0 ? (
                                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                                                <p className="t-small mb-2" style={{ color: 'var(--text-dim)' }}>MATCHED SKILLS</p>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    {job.matching_skills.map((skill, i) => (
                                                        <span key={i} className="badge-tech" style={{ fontSize: '0.75rem', borderColor: '#4ade80', color: '#4ade80' }}>
                                                            ✓ {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ padding: '0.5rem' }}>
                                                <p className="t-small" style={{ color: 'var(--text-dim)' }}>NO DIRECT SKILL MATCH DETECTED</p>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{
                                        padding: '1.2rem 2rem',
                                        borderTop: '1px solid var(--glass-border)',
                                        background: 'rgba(0,0,0,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        {job.apply_link ? (
                                            <a href={job.apply_link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                ACCESS LINK <span style={{ fontSize: '1.2em' }}>↗</span>
                                            </a>
                                        ) : <span></span>}

                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleApply(job); }}
                                            disabled={isApplied}
                                            className={isApplied ? "btn-neon-outline" : "btn-neon"}
                                            style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', opacity: isApplied ? 0.5 : 1 }}
                                        >
                                            {isApplied ? "DONE ✓" : "APPLY NOW"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
