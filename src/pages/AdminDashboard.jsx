import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react'
import { useCustomAuth } from '../context/AuthContext'
import { Sidebar } from "../components/Sidebar"
import './AdminDashboard.css';
import './ClientDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export const AdminDashboard = () => {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0()
    const { customAuth } = useCustomAuth()
    const [activeTab, setActiveTab] = useState(0);
    const [coaches, setCoaches] = useState([]);
    const [coachLoading, setCoachLoading] = useState(true);
    const [coachError, setCoachError] = useState('');
    const [coachActionId, setCoachActionId] = useState(null);

    const [exercises] = useState([
        { id: 1, name: 'Barbell Bench Press', muscle: 'Chest', equipment: 'Barbell' },
        { id: 2, name: 'Deadlift', muscle: 'Back / Hamstrings', equipment: 'Barbell' },
        { id: 3, name: 'Dumbbell Lateral Raise', muscle: 'Shoulders', equipment: 'Dumbbells' },
        { id: 4, name: 'Resistance Band Pull Apart', muscle: 'Back / Shoulders', equipment: 'Resistance Bands' },
        { id: 5, name: 'Leg Press', muscle: 'Quads / Glutes', equipment: 'Machine' },
        { id: 6, name: 'Cable Tricep Pushdown', muscle: 'Triceps', equipment: 'Cable Machine' },
    ]);

    const [coachSearch, setCoachSearch] = useState('');
    const [exerciseSearch, setExerciseSearch] = useState('');

    const getToken = async () => {
        if (isAuthenticated) {
            return getAccessTokenSilently({
                authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
            })
        }
        return customAuth || null
    }

    const fetchCoaches = async () => {
        setCoachLoading(true)
        setCoachError('')
        try {
            const token = await getToken()
            if (!token) {
                setCoachError('Log in as an admin to view coach applications.')
                setCoachLoading(false)
                return
            }

            const res = await fetch(`${API_BASE_URL}/admin/coaches`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json().catch(() => ([]))
            if (!res.ok) {
                throw new Error(data.detail || 'Failed to load coach applications')
            }
            setCoaches(data)
        } catch (err) {
            setCoachError(err.message || 'Failed to load coach applications')
        } finally {
            setCoachLoading(false)
        }
    }

    useEffect(() => {
        fetchCoaches()
    }, [isAuthenticated, customAuth])

    const updateCoachStatus = async (coachId, action) => {
        setCoachActionId(coachId)
        setCoachError('')
        try {
            const token = await getToken()
            if (!token) {
                throw new Error('Log in as an admin to manage coach applications.')
            }

            const res = await fetch(`${API_BASE_URL}/admin/coaches/${coachId}/${action}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                throw new Error(data.detail || `Failed to ${action} coach application`)
            }

            setCoaches((current) =>
                current.map((coach) =>
                    coach.coach_id === coachId
                        ? {
                            ...coach,
                            status: data.status,
                            active: data.status === 'Active',
                            accepting_clients: data.status === 'Active',
                        }
                        : coach
                )
            )
        } catch (err) {
            setCoachError(err.message || `Failed to ${action} coach application`)
        } finally {
            setCoachActionId(null)
        }
    }

    const handleApprove = (coachId) => {
        updateCoachStatus(coachId, 'approve')
    };

    const handleReject = (coachId) => {
        updateCoachStatus(coachId, 'reject')
    };

    const handleSuspend = (coachId) => {
        updateCoachStatus(coachId, 'suspend')
    };

    const handleReactivate = (coachId) => {
        updateCoachStatus(coachId, 'reactivate')
    };

    const handleDeleteExercise = (exerciseId) => {
        console.log('Delete exercise:', exerciseId);
    };

    const handleEditExercise = (exerciseId) => {
        console.log('Edit exercise:', exerciseId);
    };

    const filteredCoaches = coaches.filter((c) =>
        `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase().includes(coachSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(coachSearch.toLowerCase())
    );

    const filteredExercises = exercises.filter((e) =>
        e.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
        e.muscle.toLowerCase().includes(exerciseSearch.toLowerCase())
    );

    const getStatusClass = (status) => {
        if (status === 'Active' || status === 'Approved') return 'status-approved';
        if (status === 'Pending') return 'status-pending';
        if (status === 'Suspended') return 'status-suspended';
        return 'status-rejected';
    };

    return (
        <div>
            {/*
            <nav className="navbar">
                <Link to="/" className="nav-logo">
                    <svg viewBox="0 0 32 32" fill="none">
                        <circle cx="10" cy="16" r="7" fill="black" />
                        <circle cx="22" cy="16" r="7" fill="black" />
                        <circle cx="16" cy="16" r="5" fill="black" />
                        <rect x="6" y="14" width="20" height="4" rx="2" fill="black" />
                    </svg>
                    <span>PrimalTraining</span>
                </Link>
                <div className="nav-links">
                    <Link to="/">HOME</Link>
                    <Link to="/admin" className="active">DASHBOARD</Link>
                    <Link to="/coaches">COACHES</Link>
                    <Link to="/exercises">EXERCISES</Link>
                </div>
                <div className="nav-avatar" style={{ background: 'var(--black)' }}>AD</div>
            </nav>
            */}

            <div className="dashboard-container">
                <Sidebar />
                <div>

                    <div className="page-heading">
                        <div className="h2">
                            <span className="text-black">ADMIN </span>
                            <span className="text-purple">PANEL</span>
                        </div>
                    </div>

                    <div class="dashboard-homepage-container">

                        <div className="dashboard">

                            <div className="section-quick-stats">
                                <div className="quick-stat-card">
                                    <div className="stat-heading">Total Users</div>
                                    <div className="stat">847</div>
                                </div>
                                <div className="quick-stat-card">
                                    <div className="stat-heading">Active Coaches</div>
                                    <div className="stat">{coaches.filter((coach) => coach.status === 'Active').length}</div>
                                </div>
                                <div className="quick-stat-card">
                                    <div className="stat-heading">Pending Approvals</div>
                                    <div className="stat">{coaches.filter((coach) => coach.status === 'Pending').length} <span className="pending-dot" style={{ background: '#F5A623' }}></span></div>
                                </div>
                                <div className="quick-stat-card">
                                    <div className="stat-heading">Revenue This Month</div>
                                    <div className="stat">$18,420</div>
                                </div>
                            </div>

                            <div className="tabs">
                                {['COACH MANAGEMENT', 'EXERCISE INVENTORY', 'FINANCIAL TRACKING', 'USER ENGAGEMENT'].map((tab, i) => (
                                    <div
                                        key={i}
                                        className={`tab ${activeTab === i ? 'active' : ''}`}
                                        onClick={() => setActiveTab(i)}
                                    >
                                        {tab}
                                    </div>
                                ))}
                            </div>

                            {activeTab === 0 && (
                                <div className="tab-content">
                                    <div className="section-header">
                                        <div className="admin-section-title">Coach Applications & Accounts</div>
                                        <div className="search-bar">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6BA0" strokeWidth="2">
                                                <circle cx="11" cy="11" r="8" />
                                                <path d="m21 21-4.35-4.35" />
                                            </svg>
                                            <input
                                                type="text"
                                                placeholder="SEARCH COACHES..."
                                                value={coachSearch}
                                                onChange={(e) => setCoachSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    {coachError && <p className="admin-feedback error">{coachError}</p>}
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Coach</th>
                                                <th>Email</th>
                                                <th>Specialization</th>
                                                <th>Status</th>
                                                <th>Active</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {coachLoading ? (
                                                <tr>
                                                    <td colSpan="6">Loading coach applications...</td>
                                                </tr>
                                            ) : filteredCoaches.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6">No coach applications found.</td>
                                                </tr>
                                            ) : filteredCoaches.map((coach) => (
                                                <tr key={coach.coach_id}>
                                                    <td><strong>{coach.first_name} {coach.last_name}</strong></td>
                                                    <td>{coach.email}</td>
                                                    <td>{coach.specialization}</td>
                                                    <td><span className={`status-badge ${getStatusClass(coach.status)}`}>{coach.status}</span></td>
                                                    <td>
                                                        <label className="toggle-switch">
                                                            <input type="checkbox" checked={coach.active} readOnly disabled />
                                                            <span className="toggle-slider"></span>
                                                        </label>
                                                    </td>
                                                    <td>
                                                        {coach.status === 'Pending' ? (
                                                            <div className="actions-cell">
                                                                <button className="btn-sm btn-green" disabled={coachActionId === coach.coach_id} onClick={() => handleApprove(coach.coach_id)}>
                                                                    {coachActionId === coach.coach_id ? 'WORKING...' : 'APPROVE'}
                                                                </button>
                                                                <button className="btn-sm btn-red-outline" disabled={coachActionId === coach.coach_id} onClick={() => handleReject(coach.coach_id)}>
                                                                    {coachActionId === coach.coach_id ? 'WORKING...' : 'REJECT'}
                                                                </button>
                                                            </div>
                                                        ) : coach.status === 'Active' ? (
                                                            <button className="btn-sm btn-warn-outline" disabled={coachActionId === coach.coach_id} onClick={() => handleSuspend(coach.coach_id)}>
                                                                {coachActionId === coach.coach_id ? 'WORKING...' : 'SUSPEND'}
                                                            </button>
                                                        ) : coach.status === 'Suspended' ? (
                                                            <button className="btn-sm btn-green" disabled={coachActionId === coach.coach_id} onClick={() => handleReactivate(coach.coach_id)}>
                                                                {coachActionId === coach.coach_id ? 'WORKING...' : 'REACTIVATE'}
                                                            </button>
                                                        ) : (
                                                            <button className="btn-sm btn-outline-sm">VIEW</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 1 && (
                                <div className="tab-content">
                                    <div className="section-header">
                                        <div className="search-bar">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6BA0" strokeWidth="2">
                                                <circle cx="11" cy="11" r="8" />
                                                <path d="m21 21-4.35-4.35" />
                                            </svg>
                                            <input
                                                type="text"
                                                placeholder="SEARCH EXERCISES..."
                                                value={exerciseSearch}
                                                onChange={(e) => setExerciseSearch(e.target.value)}
                                            />
                                        </div>
                                        <button className="btn-add">+ ADD EXERCISE</button>
                                    </div>
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Exercise Name</th>
                                                <th>Muscle Group</th>
                                                <th>Equipment</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredExercises.map((exercise) => (
                                                <tr key={exercise.id}>
                                                    <td><strong>{exercise.name}</strong></td>
                                                    <td>{exercise.muscle}</td>
                                                    <td>{exercise.equipment}</td>
                                                    <td>
                                                        <div className="actions-cell">
                                                            <button className="btn-sm btn-outline-sm" onClick={() => handleEditExercise(exercise.id)}>EDIT</button>
                                                            <button className="btn-sm btn-red-outline" onClick={() => handleDeleteExercise(exercise.id)}>DELETE</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 2 && (
                                <div className="tab-content">
                                    <div className="finance-grid">
                                        <div className="finance-card">
                                            <div className="stat-label">Total Revenue</div>
                                            <div className="finance-value">$18,420</div>
                                        </div>
                                        <div className="finance-card">
                                            <div className="stat-label">Transactions This Month</div>
                                            <div className="finance-value">156</div>
                                        </div>
                                        <div className="finance-card">
                                            <div className="stat-label">Average Per Transaction</div>
                                            <div className="finance-value">$118</div>
                                        </div>
                                    </div>
                                    <div className="admin-section-title" style={{ marginBottom: '16px' }}>Monthly Revenue</div>
                                    <div className="bar-chart">
                                        {[
                                            { label: 'Sep', height: '40%' },
                                            { label: 'Oct', height: '55%' },
                                            { label: 'Nov', height: '48%' },
                                            { label: 'Dec', height: '65%' },
                                            { label: 'Jan', height: '72%' },
                                            { label: 'Feb', height: '85%' },
                                        ].map((bar) => (
                                            <div key={bar.label} className="bar-col">
                                                <div className="bar" style={{ height: bar.height }}></div>
                                                <div className="bar-label">{bar.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 3 && (
                                <div className="tab-content">
                                    <div className="engage-row">
                                        <div className="engage-card">
                                            <div className="stat-label">Daily Active Users (Last 14 Days)</div>
                                            <div className="finance-value" style={{ margin: '8px 0 16px' }}>312</div>
                                            <div className="line-chart">
                                                {[45, 52, 48, 60, 55, 42, 38, 58, 65, 70, 62, 75, 80, 85].map((h, i) => (
                                                    <div key={i} className={`line-bar ${i >= 12 ? 'highlight' : ''}`} style={{ height: `${h}%` }}></div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="engage-card">
                                            <div className="stat-label">Workouts Logged This Week</div>
                                            <div className="finance-value" style={{ margin: '8px 0 16px' }}>1,247</div>
                                            <div className="line-chart">
                                                {[30, 65, 80, 70, 85, 55, 25].map((h, i) => (
                                                    <div key={i} className={`line-bar ${i === 5 ? 'highlight' : ''}`} style={{ height: `${h}%` }}></div>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px' }}>
                                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                                                    <span key={d} className="bar-label">{d}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    
                        <div className="footer-spacer"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
