import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Survey.css';

function Survey() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = location.state?.role || 'coach';

  const [heightFeet, setHeightFeet] = useState('5');
  const [heightInches, setHeightInches] = useState('7');
  const [currentWeight, setCurrentWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('lb');
  const [fitnessGoal, setFitnessGoal] = useState('Build Muscle');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');

  const [specializations, setSpecializations] = useState([]);
  const [certifications, setCertifications] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  const handleToggleSpecialization = (spec) => {
    if (specializations.includes(spec)) {
      setSpecializations(specializations.filter((s) => s !== spec));
    } else {
      setSpecializations([...specializations, spec]);
    }
  };

  const handleSubmit = () => {
    console.log('Survey complete:', {
      heightFeet, heightInches, currentWeight, goalWeight,
      weightUnit, fitnessGoal, experienceLevel,
      specializations, certifications, yearsExperience, hourlyRate,
    });
    navigate('/client-dashboard');
  };

  return (
    <div>
      <Navbar />

      <div className="page-title">
        <h1>INITIAL <span className="accent">SURVEY</span></h1>
      </div>

      <div className="progress-section">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '100%' }}></div>
        </div>
        <div className="progress-label">Step 1 of 1 — Basic Info</div>
      </div>

      <div className="survey-content">
        <div className="section-card">
          <div className="section-title">Body Metrics</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Height (Feet)</label>
              <select className="form-input" value={heightFeet} onChange={(e) => setHeightFeet(e.target.value)}>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Height (Inches)</label>
              <select className="form-input" value={heightInches} onChange={(e) => setHeightInches(e.target.value)}>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Current Weight</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="form-input"
                  placeholder="175"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                />
                <div className="unit-toggle">
                  <button type="button" className={`unit-btn ${weightUnit === 'lb' ? 'selected' : ''}`} onClick={() => setWeightUnit('lb')}>LB</button>
                  <button type="button" className={`unit-btn ${weightUnit === 'kg' ? 'selected' : ''}`} onClick={() => setWeightUnit('kg')}>KG</button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Goal Weight</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="form-input"
                  placeholder="165"
                  value={goalWeight}
                  onChange={(e) => setGoalWeight(e.target.value)}
                />
                <div className="unit-toggle">
                  <button type="button" className={`unit-btn ${weightUnit === 'lb' ? 'selected' : ''}`} onClick={() => setWeightUnit('lb')}>LB</button>
                  <button type="button" className={`unit-btn ${weightUnit === 'kg' ? 'selected' : ''}`} onClick={() => setWeightUnit('kg')}>KG</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-title">Fitness Goal</div>

          <div className="form-group">
            <label className="form-label">What is your primary goal?</label>
            <div className="pill-selector">
              {['Lose Weight', 'Build Muscle', 'Improve Endurance', 'Stay Healthy', 'Other'].map((goal) => (
                <div
                  key={goal}
                  className={`pill-option ${fitnessGoal === goal ? 'selected' : ''}`}
                  onClick={() => setFitnessGoal(goal)}
                >
                  {goal}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '24px' }}>
            <label className="form-label">Experience Level</label>
            <div className="pill-selector">
              {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                <div
                  key={level}
                  className={`pill-option ${experienceLevel === level ? 'selected' : ''}`}
                  onClick={() => setExperienceLevel(level)}
                >
                  {level}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="coach-section">
          <div className="coach-badge">Coach Only</div>
          <div className="section-title">Coach Information</div>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Specialization</label>
              <div className="checkbox-group">
                {['Workout Coach', 'Nutritionist', 'Both'].map((spec) => (
                  <div
                    key={spec}
                    className={`checkbox-item ${specializations.includes(spec) ? 'checked' : ''}`}
                    onClick={() => handleToggleSpecialization(spec)}
                  >
                    <div className="checkbox-box">
                      {specializations.includes(spec) && '✓'}
                    </div>
                    <span className="checkbox-text">{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Hourly Rate ($)</label>
              <input
                type="number"
                className="form-input"
                placeholder="75"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input
                type="number"
                className="form-input"
                placeholder="5"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Certifications</label>
              <textarea
                className="form-input"
                placeholder="E.G. NASM-CPT, ACE, ISSA..."
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="survey-buttons">
          <button className="btn-periwinkle" onClick={handleSubmit}>COMPLETE SETUP</button>
        </div>
      </div>

      <div className="footer-spacer"></div>
    </div>
  );
}

export default Survey;
