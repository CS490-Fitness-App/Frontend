import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './ClientDashboard.css';

function ClientDashboard() {
  return (
    <div>
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
          <Link to="/client-dashboard" className="active">DASHBOARD</Link>
        </div>
        <div className="nav-right">
          <div className="nav-bell">
            <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <div className="nav-bell-badge"></div>
          </div>
          <div className="nav-avatar">AJ</div>
        </div>
      </nav>

      <div className="page-title">
        <h1>WELCOME BACK, <span className="accent">ALEX</span></h1>
      </div>

      <div className="dashboard">
        <div className="stat-row">
          <div className="stat-card">
            <div className="stat-label">Today's Workout</div>
            <div className="stat-value">Push Day</div>
            <div className="stat-sub">Chest, Shoulders, Triceps</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Weekly Streak</div>
            <div className="stat-value">4 / 7</div>
            <div className="stat-sub">Keep it up! 3 days left</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Current Weight</div>
            <div className="stat-value">172 LB</div>
            <div className="stat-sub">Goal: 165 lb · -3 lb this month</div>
          </div>
        </div>

        <div className="main-row">
          <div className="card">
            <div className="card-title">My Workout Plan</div>
            <div className="card-content">
              <div className="card-info-row">
                <span className="card-info-label">Current Plan</span>
                <span className="card-info-value">PPL — Push Pull Legs</span>
              </div>
              <div className="card-info-row">
                <span className="card-info-label">Next Workout</span>
                <span className="card-info-value">Pull Day — Tomorrow</span>
              </div>
              <div className="card-info-row">
                <span className="card-info-label">Weeks Completed</span>
                <span className="card-info-value">6 of 12</span>
              </div>
            </div>
            <button className="card-btn">VIEW PLAN</button>
          </div>

          <div className="card">
            <div className="card-title">My Coach</div>
            <div className="card-content">
              <div className="coach-info">
                <div className="coach-avatar">MR</div>
                <div className="coach-details">
                  <div className="coach-name">Marcus Rivera</div>
                  <div className="coach-spec">Workout Coach · ★ 4.9</div>
                </div>
              </div>
              <div className="card-info-row">
                <span className="card-info-label">Status</span>
                <span className="card-info-value" style={{ color: '#34A853' }}>Active</span>
              </div>
              <div className="card-info-row">
                <span className="card-info-label">Next Session</span>
                <span className="card-info-value">Wed, 3:00 PM</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="card-btn" style={{ flex: 1 }}>MESSAGE</button>
              <button className="card-btn card-btn-outline" style={{ flex: 1 }}>VIEW PROFILE</button>
            </div>
          </div>
        </div>

        <div className="action-row">
          <div className="action-card">
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#8B8BF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20V10" />
                <path d="M18 20V4" />
                <path d="M6 20v-4" />
              </svg>
            </div>
            <div className="action-title">Log Activity</div>
            <div className="action-desc">Record your sets, reps, weights, and cardio for today's workout.</div>
            <button className="card-btn">LOG NOW</button>
          </div>

          <div className="action-card">
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#8B8BF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <div className="action-title">Daily Check-In</div>
            <div className="action-desc">Log your calories, steps, water intake, weight, and mood for today.</div>
            <button className="card-btn">CHECK IN</button>
          </div>

          <div className="action-card">
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#8B8BF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
                <line x1="2" y1="20" x2="22" y2="20" />
              </svg>
            </div>
            <div className="action-title">View Progress</div>
            <div className="action-desc">See your charts and trends over the past weeks and months.</div>
            <button className="card-btn">VIEW CHARTS</button>
          </div>
        </div>
      </div>

      <div className="quick-links-banner">
        <div className="quick-links-label">Quick Links</div>
        <div className="quick-links">
          <Link to="/exercises">Exercise Library</Link>
          <Link to="/meals">Meal Plans</Link>
          <Link to="/chat">Chat</Link>
          <Link to="/profile/edit">Edit Profile</Link>
          <Link to="/coaches">Browse Coaches</Link>
        </div>
      </div>

      <div className="footer-spacer"></div>
    </div>
  );
}

export default ClientDashboard;
