import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useCustomAuth } from '../context/AuthContext';
import { Sidebar } from "../components/Sidebar"
import './CoachDashboard.css';
import './ClientDashboard.css';
import { API_BASE_URL } from '../utils/apiBaseUrl';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const parseUTC = (str) => new Date(str ? str.replace(' ', 'T').replace(/(?<!\+\d{2}:\d{2}|Z)$/, 'Z') : null);

const parseAvailability = (availStrings) => {
    const days = [];
    let start = '09:00';
    let end = '17:00';
    if (availStrings && availStrings.length > 0) {
        availStrings.forEach((s, i) => {
            const [day, times] = s.split(' ');
            days.push(day);
            if (i === 0) {
                const [st, en] = times.split('-');
                start = st.slice(0, 5);
                end = en.slice(0, 5);
            }
        });
    }
    return { days, start, end };
};

export const CoachDashboard = () => {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    const { customAuth } = useCustomAuth();
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [notifications] = useState([]);
    const [coachId, setCoachId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [monthlyEarnings, setMonthlyEarnings] = useState(0);

    const [showAvailModal, setShowAvailModal] = useState(false);
    const [availDays, setAvailDays] = useState([]);
    const [availStart, setAvailStart] = useState('09:00');
    const [availEnd, setAvailEnd] = useState('17:00');
    const [availSaving, setAvailSaving] = useState(false);
    const [availError, setAvailError] = useState('');

    const getToken = async () => {
        if (isAuthenticated) {
            return getAccessTokenSilently({
                authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
            });
        }
        return customAuth || null;
    };

    const loadDashboard = async () => {
        setLoading(true);
        setError('');
        try {
            const token = await getToken();
            if (!token) { setError('Not authenticated'); setLoading(false); return; }

            const meRes = await fetch(`${API_BASE_URL}/coaches/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!meRes.ok) throw new Error('Failed to load coach profile.');
            const meData = await meRes.json();
            const myCoachId = meData.coach_id;
            setCoachId(myCoachId);

            const { days, start, end } = parseAvailability(meData.availability);
            setAvailDays(days);
            setAvailStart(start);
            setAvailEnd(end);

            const clientsRes = await fetch(`${API_BASE_URL}/coaches/${myCoachId}/clients`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!clientsRes.ok) throw new Error('Failed to load clients.');
            const clientsData = await clientsRes.json();
            setClients(clientsData.active_clients);
            setPendingRequests(clientsData.pending_requests);

            // Keep payment notifications and auto-charge in sync, then load latest billing summary.
            await fetch(`${API_BASE_URL}/payments/billing/poll`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            }).catch(() => null);

            const billingRes = await fetch(`${API_BASE_URL}/payments/billing/summary`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (billingRes.ok) {
                const billingData = await billingRes.json();
                setMonthlyEarnings(Number(billingData.monthly_total || 0));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, [isAuthenticated, customAuth]);

    useEffect(() => {
        if (!isAuthenticated && !customAuth) {
            return;
        }

        const intervalId = setInterval(() => {
            loadDashboard();
        }, 60000);

        return () => clearInterval(intervalId);
    }, [isAuthenticated, customAuth]);

    const handleAccept = async (clientId) => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/coaches/request/accept?client_id=${clientId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || 'Failed to accept request.');
            }
            await loadDashboard();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDecline = async (clientId) => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/coaches/request/decline?client_id=${clientId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || 'Failed to decline request.');
            }
            await loadDashboard();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleViewClient = (clientUserId) => {
        navigate(`/view-progress?client_id=${clientUserId}`);
    };

    const handleMessageClient = async (clientUserId) => {
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${API_BASE_URL}/chats/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ other_user_id: clientUserId }),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.detail || 'Failed to open client chat.');
            }

            const chat = await response.json();
            navigate(`/chat?chat=${chat.chat_id}`);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleTerminateContract = async (clientId, clientName) => {
        if (!window.confirm(`Are you sure you want to terminate the contract with ${clientName}?`)) return;
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/coaches/contract/end?other_user_id=${clientId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || 'Failed to terminate contract.');
            }
            await loadDashboard();
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleDay = (day) => {
        setAvailDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSaveAvailability = async () => {
        setAvailSaving(true);
        setAvailError('');
        try {
            const token = await getToken();
            const slots = availDays.map(day => ({
                day_of_week: day,
                start_time: availStart + ':00',
                end_time: availEnd + ':00',
            }));
            const res = await fetch(`${API_BASE_URL}/coaches/me/availability`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(slots),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || 'Failed to save availability.');
            }
            setShowAvailModal(false);
        } catch (err) {
            setAvailError(err.message);
        } finally {
            setAvailSaving(false);
        }
    };

    return (
        <div>
            <div className="dashboard-container">
                <Sidebar />
                <div>
                    <div className="page-heading">
                        <div className="h2">
                            <span className="text-black">COACH </span>
                            <span className="text-purple">DASHBOARD</span>
                        </div>
                    </div>

                    <div className="dashboard-homepage-container">

                        <div className="dashboard">
                            {error && <p className="feedback-msg error" style={{ padding: '1rem 0' }}>{error}</p>}

                            <div className="section-quick-stats">
                                <div className="quick-stat-card">
                                    <div className="stat-heading">Active Clients</div>
                                    <div className="stat">{loading ? '...' : clients.length}</div>
                                </div>
                                <div className="quick-stat-card">
                                    <div className="stat-heading">Pending Requests</div>
                                    <div className="stat">{loading ? '...' : pendingRequests.length} <span className="pending-dot"></span></div>
                                </div>
                                <div className="quick-stat-card">
                                    <div className="stat-heading">Reviews</div>
                                    <div className="stat">—</div>
                                </div>
                                <div className="quick-stat-card">
                                    <div className="stat-heading">This Month's Earnings</div>
                                    <div className="stat">{loading ? '...' : `$${monthlyEarnings.toFixed(2)}`}</div>
                                </div>
                            </div>

                            <div className="two-col">
                                <div className="card">
                                    <div className="dashboard-heading">My Clients</div>
                                    <table className="client-table">
                                        <thead>
                                            <tr>
                                                <th>Client</th>
                                                <th>Since</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan="3"><span className="state-message loading">Loading...</span></td></tr>
                                            ) : clients.length === 0 ? (
                                                <tr><td colSpan="3"><span className="state-message">No active clients yet.</span></td></tr>
                                            ) : clients.map((client) => {
                                                const initials = `${client.first_name?.[0] || ''}${client.last_name?.[0] || ''}`;
                                                const fullName = `${client.first_name} ${client.last_name}`;
                                                return (
                                                    <tr key={client.client_id}>
                                                        <td>
                                                            <div className="client-row">
                                                                <div className="client-avatar">{initials}</div>
                                                                <span className="client-name">{fullName}</span>
                                                            </div>
                                                        </td>
                                                        <td>{client.since ? parseUTC(client.since).toLocaleDateString() : '—'}</td>
                                                        <td>
                                                            <div className="client-row-actions">
                                                                <button className="btn-sm btn-periwinkle" onClick={() => handleViewClient(client.user_id)}>
                                                                    VIEW
                                                                </button>
                                                                <button className="btn-sm btn-outline-dark" onClick={() => handleMessageClient(client.user_id)}>
                                                                    MESSAGE
                                                                </button>
                                                                <button className="btn-sm btn-red" onClick={() => handleTerminateContract(client.client_id, `${client.first_name} ${client.last_name}`)}>
                                                                    TERMINATE
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="card">
                                        <div>
                                            <div className="dashboard-heading">Pending Requests</div>
                                            {loading ? (
                                                <p className="state-message loading">Loading...</p>
                                            ) : pendingRequests.length === 0 ? (
                                                <p className="state-message">No pending requests.</p>
                                            ) : pendingRequests.map((request) => {
                                                const initials = `${request.first_name?.[0] || ''}${request.last_name?.[0] || ''}`;
                                                const fullName = `${request.first_name} ${request.last_name}`;
                                                return (
                                                    <div key={request.client_id} className="request-item">
                                                        <div className="request-info">
                                                            <div className="client-avatar">{initials}</div>
                                                            <div>
                                                                <div className="request-name">{fullName}</div>
                                                            </div>
                                                        </div>
                                                        <div className="request-actions">
                                                            <button className="btn-sm btn-green" onClick={() => handleAccept(request.client_id)}>ACCEPT</button>
                                                            <button className="btn-sm btn-red" onClick={() => handleDecline(request.client_id)}>DECLINE</button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                </div>
                            </div>

                            <div className="bottom-actions">
                                <button className="btn-periwinkle" onClick={() => setShowAvailModal(true)}>SET AVAILABILITY</button>
                                <button className="btn-outline">UPDATE QUALIFICATIONS</button>
                            </div>
                        </div>

                        <div className="footer-spacer"></div>
                    </div>

                    {showAvailModal && (
                        <div className="avail-modal-overlay" onClick={() => setShowAvailModal(false)}>
                            <div className="avail-modal" onClick={e => e.stopPropagation()}>
                                <div className="avail-modal-header">
                                    <span className="avail-modal-title">SET AVAILABILITY</span>
                                    <button className="avail-modal-close" onClick={() => setShowAvailModal(false)}>✕</button>
                                </div>

                                <p className="avail-modal-label">Select days</p>
                                <div className="avail-grid">
                                    {DAYS.map(day => (
                                        <button
                                            key={day}
                                            className={`avail-toggle${availDays.includes(day) ? ' active' : ''}`}
                                            onClick={() => toggleDay(day)}
                                            type="button"
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>

                                <div className="avail-time-row">
                                    <div className="avail-time-group">
                                        <label className="avail-modal-label">Start time</label>
                                        <input
                                            type="time"
                                            className="avail-time-input"
                                            value={availStart}
                                            onChange={e => setAvailStart(e.target.value)}
                                        />
                                    </div>
                                    <div className="avail-time-group">
                                        <label className="avail-modal-label">End time</label>
                                        <input
                                            type="time"
                                            className="avail-time-input"
                                            value={availEnd}
                                            onChange={e => setAvailEnd(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {availError && <p className="feedback-msg error">{availError}</p>}

                                <div className="avail-modal-actions">
                                    <button className="btn-outline" onClick={() => setShowAvailModal(false)}>CANCEL</button>
                                    <button
                                        className="btn-periwinkle"
                                        onClick={handleSaveAvailability}
                                        disabled={availSaving}
                                    >
                                        {availSaving ? 'SAVING...' : 'SAVE'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
