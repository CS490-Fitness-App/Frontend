import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CoachDashboard.css';

export const CoachDashboard = () => {
    const [clients] = useState([
        { id: 1, initials: 'AJ', name: 'Alex Johnson', goal: 'Build Muscle', lastActive: 'Today' },
        { id: 2, initials: 'SK', name: 'Sarah Kim', goal: 'Lose Weight', lastActive: 'Yesterday' },
        { id: 3, initials: 'JD', name: 'James Davis', goal: 'Endurance', lastActive: '2 days ago' },
        { id: 4, initials: 'LP', name: 'Lisa Park', goal: 'Stay Healthy', lastActive: '3 days ago' },
        { id: 5, initials: 'TW', name: 'Tom Wilson', goal: 'Build Muscle', lastActive: 'Today' },
    ]);

    const [pendingRequests] = useState([
        { id: 1, initials: 'RN', name: 'Rachel Nguyen', goal: 'Lose Weight' },
        { id: 2, initials: 'MB', name: 'Mike Brown', goal: 'Build Muscle' },
        { id: 3, initials: 'EC', name: 'Emily Chen', goal: 'Endurance' },
    ]);

    const [notifications] = useState([
        { id: 1, text: 'Alex Johnson logged a workout — Push Day completed', time: '12 min ago' },
        { id: 2, text: 'Sarah Kim sent you a message', time: '1 hour ago' },
        { id: 3, text: 'Tom Wilson completed his daily check-in', time: '3 hours ago' },
        { id: 4, text: 'New review from Lisa Park — ★★★★★', time: 'Yesterday' },
    ]);

    const handleAccept = (requestId) => {
        console.log('Accepted request:', requestId);
    };

    const handleDecline = (requestId) => {
        console.log('Declined request:', requestId);
    };

    const handleViewClient = (clientId) => {
        console.log('View client:', clientId);
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
                    <Link to="/exercises">EXERCISES</Link>
                    <Link to="/coach-dashboard" className="active">DASHBOARD</Link>
                    <Link to="/clients">CLIENTS</Link>
                </div>
                <div className="nav-right">
                    <div className="nav-bell">
                        <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <div className="nav-bell-badge"></div>
                    </div>
                    <div className="nav-avatar">MR</div>
                </div>
            </nav>
            */}

            <div className="page-title">
                <h1>COACH <span className="accent">DASHBOARD</span></h1>
            </div>

            <div className="dashboard">
                <div className="stat-row-4">
                    <div className="stat-card">
                        <div className="stat-label">Active Clients</div>
                        <div className="stat-value">12</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Pending Requests</div>
                        <div className="stat-value">3 <span className="pending-dot"></span></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Reviews</div>
                        <div className="stat-value">4.8 ★</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">This Month's Earnings</div>
                        <div className="stat-value">$2,340</div>
                    </div>
                </div>

                <div className="two-col">
                    <div className="card">
                        <div className="card-title">My Clients</div>
                        <table className="client-table">
                            <thead>
                                <tr>
                                    <th>Client</th>
                                    <th>Goal</th>
                                    <th>Last Active</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client) => (
                                    <tr key={client.id}>
                                        <td>
                                            <div className="client-row">
                                                <div className="client-avatar">{client.initials}</div>
                                                <span className="client-name">{client.name}</span>
                                            </div>
                                        </td>
                                        <td><span className="goal-tag">{client.goal}</span></td>
                                        <td>{client.lastActive}</td>
                                        <td>
                                            <button className="btn-sm btn-periwinkle" onClick={() => handleViewClient(client.id)}>
                                                VIEW
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <a href="#" className="view-all">View All 12 Clients →</a>
                    </div>

                    <div>
                        <div className="card">
                            <div className="card-title">Pending Requests</div>
                            {pendingRequests.map((request) => (
                                <div key={request.id} className="request-item">
                                    <div className="request-info">
                                        <div className="client-avatar">{request.initials}</div>
                                        <div>
                                            <div className="request-name">{request.name}</div>
                                            <div className="request-goal">{request.goal}</div>
                                        </div>
                                    </div>
                                    <div className="request-actions">
                                        <button className="btn-sm btn-green" onClick={() => handleAccept(request.id)}>ACCEPT</button>
                                        <button className="btn-sm btn-red" onClick={() => handleDecline(request.id)}>DECLINE</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="card" style={{ marginTop: '20px' }}>
                            <div className="card-title">Notifications</div>
                            {notifications.map((notif) => (
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
                    <button className="btn-periwinkle">SET AVAILABILITY</button>
                    <button className="btn-outline">UPDATE QUALIFICATIONS</button>
                </div>
            </div>

            <div className="footer-spacer"></div>
        </div>
    );
}