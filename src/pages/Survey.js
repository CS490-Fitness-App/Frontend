import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Survey.css';

function Survey() {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

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
  const [education, setEducation] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [pricingModel, setPricingModel] = useState('Per Hour');
  const [availableDays, setAvailableDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startTime, setStartTime] = useState('9:00 AM');
  const [endTime, setEndTime] = useState('5:00 PM');
  const [maxClients, setMaxClients] = useState('15');
  const [sessionFormat, setSessionFormat] = useState('Virtual');

  const handleToggleSpecialization = (spec) => {
    if (specializations.includes(spec)) {
      setSpecializations(specializations.filter((s) => s !== spec));
    } else {
      setSpecializations([...specializations, spec]);
    }
  };

  const handleToggleDay = (day) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      console.log('Survey complete:', {
        heightFeet, heightInches, currentWeight, goalWeight,
        weightUnit, fitnessGoal, experienceLevel,
        specializations, certifications, yearsExperience,
        education, bio, hourlyRate, pricingModel,
        availableDays, startTime, endTime, maxClients, sessionFormat,
      });
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="page-title">
        <h1>TELL US ABOUT <span className="accent">YOURSELF</span></h1>
      </div>

      <div className="progress-section">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="progress-label">
          Step {currentStep} of {totalSteps} — {currentStep === 1 ? 'Basic Info' : 'Coach Setup'}
        </div>
      </div>

      <div className="survey-content">

        {currentStep === 1 && (
          <>
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
          </>
        )}

        {currentStep === 2 && (
          <>
            <div className="coach-section">
              <div className="coach-badge">Coach Only — Step 2</div>
              <div className="section-title">Your Specialization</div>
              <div className="form-group">
                <label className="form-label">What do you specialize in?</label>
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
            </div>

            <div className="section-card">
              <div className="section-title">Qualifications & Experience</div>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">Certifications</label>
                  <textarea
                    className="form-input"
                    placeholder="E.G. NASM-CPT, ACE, ISSA, CSCS..."
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <select className="form-input" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)}>
                    <option value="">SELECT</option>
                    <option>Less than 1 year</option>
                    <option>1 - 2 years</option>
                    <option>3 - 5 years</option>
                    <option>5 - 10 years</option>
                    <option>10+ years</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Highest Education</label>
                  <select className="form-input" value={education} onChange={(e) => setEducation(e.target.value)}>
                    <option value="">SELECT</option>
                    <option>High School</option>
                    <option>Bachelor's Degree</option>
                    <option>Master's Degree</option>
                    <option>Doctorate</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Short Bio (Visible to Clients)</label>
                  <textarea
                    className="form-input"
                    placeholder="TELL CLIENTS ABOUT YOURSELF..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="section-card">
              <div className="section-title">Pricing</div>
              <div className="form-grid">
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
                  <label className="form-label">Pricing Model</label>
                  <div className="pill-selector">
                    {['Per Hour', 'Per Month', 'Per Session'].map((model) => (
                      <div
                        key={model}
                        className={`pill-option ${pricingModel === model ? 'selected' : ''}`}
                        onClick={() => setPricingModel(model)}
                      >
                        {model}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="banner-divider"></div>

            <div className="section-card">
              <div className="section-title">Availability</div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Select the days you're available</label>
                <div className="avail-grid">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="avail-day">
                      <div className="avail-day-label">{day}</div>
                      <div
                        className={`avail-toggle ${availableDays.includes(day) ? 'active' : ''}`}
                        onClick={() => handleToggleDay(day)}
                      >
                        {availableDays.includes(day) ? '✓' : '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Default Start Time</label>
                  <select className="form-input" value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                    {['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM'].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Default End Time</label>
                  <select className="form-input" value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                    {['3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="section-card">
              <div className="section-title">Session Preferences</div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Max Clients</label>
                  <input
                    type="number"
                    className="form-input"
                    value={maxClients}
                    onChange={(e) => setMaxClients(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Session Format</label>
                  <div className="pill-selector">
                    {['Virtual', 'In-Person', 'Both'].map((format) => (
                      <div
                        key={format}
                        className={`pill-option ${sessionFormat === format ? 'selected' : ''}`}
                        onClick={() => setSessionFormat(format)}
                      >
                        {format}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="survey-buttons">
          {currentStep > 1 && (
            <button className="btn-outline" onClick={handleBack}>← BACK</button>
          )}
          <button className="btn-periwinkle" onClick={handleNext}>
            {currentStep < totalSteps ? 'NEXT →' : 'COMPLETE SETUP'}
          </button>
        </div>
      </div>

      <div className="footer-spacer"></div>
    </div>
  );
}

export default Survey;
