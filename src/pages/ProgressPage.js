import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProgressPage.css';

function ProgressPage() {
  const [timeRange, setTimeRange] = useState('1 Month');

  const weightData = [95, 90, 88, 85, 82, 80, 78, 75, 73, 72, 70, 68, 65, 63, 60, 58, 55, 53, 52, 50, 50, 48, 47, 46, 44, 43, 42, 40];
  const stepsData = [65, 80, 55, 90, 72, 95, 45];
  const waterData = [80, 90, 60, 100, 75, 50, 40];
  const engagementData = [30, 65, 80, 70, 85, 55, 25];

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
          <Link to="/client-dashboard">DASHBOARD</Link>
          <Link to="/progress" className="active">PROGRESS</Link>
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
        <h1>MY <span className="accent">PROGRESS</span></h1>
      </div>

      <div className="progress-content">
        <div className="controls-row">
          <div className="pill-selector">
            {['1 Week', '1 Month', '3 Months', '6 Months', '1 Year'].map((range) => (
              <div
                key={range}
                className={`pill-option ${timeRange === range ? 'selected' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </div>
            ))}
          </div>
          <div className="date-range">Jan 28 — Feb 28, 2026</div>
        </div>

        <div className="progress-stat-row">
          <div className="progress-stat-card">
            <div className="progress-stat-label">Current Weight</div>
            <div className="progress-stat-value">172 lb</div>
            <div className="progress-stat-change negative">↓ -3 lb</div>
          </div>
          <div className="progress-stat-card">
            <div className="progress-stat-label">Avg Calories / Day</div>
            <div className="progress-stat-value">2,180</div>
            <div className="progress-stat-change positive">On target</div>
          </div>
          <div className="progress-stat-card">
            <div className="progress-stat-label">Workouts Completed</div>
            <div className="progress-stat-value">18</div>
            <div className="progress-stat-change positive">↑ +4 vs last month</div>
          </div>
          <div className="progress-stat-card">
            <div className="progress-stat-label">Avg Daily Steps</div>
            <div className="progress-stat-value">8,420</div>
            <div className="progress-stat-change positive">↑ +12%</div>
          </div>
        </div>

        <div className="chart-grid-2">
          <div className="chart-card">
            <div className="chart-title">Weight Over Time</div>
            <div className="line-chart-container">
              <div className="line-chart-y-axis">
                <div className="y-label">180</div>
                <div className="y-label">176</div>
                <div className="y-label">172</div>
                <div className="y-label">168</div>
                <div className="y-label">164</div>
              </div>
              <div className="line-chart-area">
                <div className="line-chart-grid">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="grid-line"></div>
                  ))}
                </div>
                <div className="line-chart-bars">
                  {weightData.map((h, i) => (
                    <div key={i} className="chart-bar primary" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
              <div className="line-chart-x-axis">
                <div className="x-label">Week 1</div>
                <div className="x-label">Week 2</div>
                <div className="x-label">Week 3</div>
                <div className="x-label">Week 4</div>
              </div>
            </div>
            <div className="chart-note">Goal: 165 lb (dashed line)</div>
          </div>

          <div className="chart-card">
            <div className="chart-title">Workout Breakdown</div>
            <div className="pie-chart-container">
              <div
                className="pie-chart"
                style={{
                  background: 'conic-gradient(#8B8BF5 0% 42%, #D6D6FF 42% 67%, #F5A623 67% 83%, #34A853 83% 100%)'
                }}
              ></div>
              <div className="pie-legend">
                <div className="legend-item">
                  <div className="legend-dot" style={{ background: '#8B8BF5' }}></div>
                  <span className="legend-label">Strength</span>
                  <span className="legend-value">42%</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot" style={{ background: '#D6D6FF' }}></div>
                  <span className="legend-label">Cardio</span>
                  <span className="legend-value">25%</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot" style={{ background: '#F5A623' }}></div>
                  <span className="legend-label">Flexibility</span>
                  <span className="legend-value">16%</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot" style={{ background: '#34A853' }}></div>
                  <span className="legend-label">Rest Days</span>
                  <span className="legend-value">17%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="banner-divider"></div>

        <div className="chart-grid-2">
          <div className="chart-card">
            <div className="chart-title">Calories — Intake vs Burned</div>
            <div className="grouped-bar-chart">
              {[
                { label: 'Wk 1', intake: 75, burned: 60 },
                { label: 'Wk 2', intake: 80, burned: 65 },
                { label: 'Wk 3', intake: 70, burned: 72 },
                { label: 'Wk 4', intake: 68, burned: 70 },
              ].map((week) => (
                <div key={week.label} className="bar-group">
                  <div className="bar-pair">
                    <div className="chart-bar primary" style={{ height: `${week.intake}%` }}></div>
                    <div className="chart-bar accent" style={{ height: `${week.burned}%` }}></div>
                  </div>
                  <div className="bar-group-label">{week.label}</div>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="chart-legend-item">
                <div className="chart-legend-dot" style={{ background: '#8B8BF5' }}></div>
                <span className="chart-legend-text">Intake</span>
              </div>
              <div className="chart-legend-item">
                <div className="chart-legend-dot" style={{ background: '#F5A623' }}></div>
                <span className="chart-legend-text">Burned</span>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-title">Daily Steps (Last 7 Days)</div>
            <div className="line-chart-container">
              <div className="line-chart-y-axis">
                <div className="y-label">12K</div>
                <div className="y-label">10K</div>
                <div className="y-label">8K</div>
                <div className="y-label">6K</div>
                <div className="y-label">4K</div>
              </div>
              <div className="line-chart-area">
                <div className="line-chart-grid">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="grid-line"></div>
                  ))}
                </div>
                <div className="line-chart-bars">
                  {stepsData.map((h, i) => (
                    <div
                      key={i}
                      className={`chart-bar ${i === 5 ? 'accent-green' : 'primary'}`}
                      style={{ height: `${h}%` }}
                    ></div>
                  ))}
                </div>
              </div>
              <div className="line-chart-x-axis">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="x-label">{day}</div>
                ))}
              </div>
            </div>
            <div className="chart-note">Goal: 10,000 steps/day</div>
          </div>
        </div>

        <div className="chart-grid-3">
          <div className="chart-card">
            <div className="chart-title">Strength Progress</div>
            <div className="strength-list">
              {[
                { name: 'Bench Press', weight: '185 lb', percent: 78 },
                { name: 'Squat', weight: '225 lb', percent: 85 },
                { name: 'Deadlift', weight: '275 lb', percent: 92 },
                { name: 'OHP', weight: '115 lb', percent: 60 },
              ].map((lift) => (
                <div key={lift.name} className="strength-item">
                  <div className="strength-header">
                    <span className="strength-name">{lift.name}</span>
                    <span className="strength-weight">{lift.weight}</span>
                  </div>
                  <div className="strength-bar-bg">
                    <div className="strength-bar-fill" style={{ width: `${lift.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-title">Water Intake</div>
            <div className="simple-bar-chart">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className="bar-group">
                  <div className="bar-pair" style={{ height: '120px' }}>
                    <div
                      className={`chart-bar ${i >= 5 ? 'secondary' : 'primary'}`}
                      style={{ height: `${waterData[i]}%` }}
                    ></div>
                  </div>
                  <div className="bar-group-label">{day}</div>
                </div>
              ))}
            </div>
            <div className="chart-note">Goal: 8 glasses / day</div>
          </div>

          <div className="chart-card">
            <div className="chart-title">Mood This Month</div>
            <div className="mood-pie-container">
              <div
                className="pie-chart small"
                style={{
                  background: 'conic-gradient(#34A853 0% 52%, #8B8BF5 52% 78%, #F5A623 78% 92%, #EA4335 92% 100%)'
                }}
              ></div>
            </div>
            <div className="pie-legend">
              <div className="legend-item">
                <div className="legend-dot" style={{ background: '#34A853' }}></div>
                <span className="legend-label">Great</span>
                <span className="legend-value">52%</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: '#8B8BF5' }}></div>
                <span className="legend-label">Good</span>
                <span className="legend-value">26%</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: '#F5A623' }}></div>
                <span className="legend-label">Okay</span>
                <span className="legend-value">14%</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: '#EA4335' }}></div>
                <span className="legend-label">Low</span>
                <span className="legend-value">8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-spacer"></div>
    </div>
  );
}

export default ProgressPage;
