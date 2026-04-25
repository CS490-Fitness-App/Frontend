import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useCustomAuth } from '../context/AuthContext';
import { Sidebar } from "../components/Sidebar"
import './CoachDashboard.css';
import './ClientDashboard.css';
import { API_BASE_URL } from '../utils/apiBaseUrl';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

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
    const [clients, setClients] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [notifications] = useState([]);
    const [coachId, setCoachId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
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

    const handleViewClient = (clientId) => {
        console.log('View client:', clientId);
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

                    <div class="dashboard-homepage-container">

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
                                    <div className="stat">—</div>
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
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan="3">Loading...</td></tr>
                                            ) : clients.length === 0 ? (
                                                <tr><td colSpan="3">No active clients yet.</td></tr>
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
                                                            <button className="btn-sm btn-periwinkle" onClick={() => handleViewClient(client.client_id)}>
                                                                VIEW
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div>
                                    <div className="card">
                                        <div>
                                            <div className="dashboard-heading">Pending Requests</div>
                                            {loading ? (
                                                <p>Loading...</p>
                                            ) : pendingRequests.length === 0 ? (
                                                <p>No pending requests.</p>
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

                                    <div className="card" style={{ marginTop: '20px' }}>
                                        <div className="dashboard-heading">Notifications</div>
                                        {notifications.length === 0 ? (
                                            <p style={{ color: '#888', fontSize: '0.9rem' }}>No notifications.</p>
                                        ) : notifications.map((notif) => (
                                            <div key={notif.id} className="notif-item">
                                                <div className="notif-dot"></div>
                                                <div>
                                                    <div className="notif-text">{notif.text}</div>
                                                    <div className="notif-time">{notif.time}</div>
                                                </div>
                                            </div>
                                        ))}
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
