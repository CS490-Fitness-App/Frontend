import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useCustomAuth } from '../context/AuthContext';
import '../styles/global.css'
import './Survey.css';
import { API_BASE_URL } from '../utils/apiBaseUrl';

export const Survey = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const { customAuth } = useCustomAuth();

  const role = location.state?.role || 'client';
  const totalSteps = role === 'coach' ? 2 : 1;

  const [currentStep, setCurrentStep] = useState(1);

  const [heightFeet, setHeightFeet] = useState('5');
  const [heightInches, setHeightInches] = useState('7');
  const [currentWeight, setCurrentWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('lb');
  const [fitnessGoal, setFitnessGoal] = useState('Build Muscle');
  const [selectedGoalTypeId, setSelectedGoalTypeId] = useState(null);
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

  const [goalTypes, setGoalTypes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/users/goal-types`)
      .then(res => res.json())
      .then(data => {
        setGoalTypes(data);
        if (data.length > 0) setSelectedGoalTypeId(data[0].goal_type_id);
      })
      .catch(err => console.error('Failed to fetch goal types:', err));
  }, []);

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

  const to24Hour = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
      return;
    }

    // --- Submit ---
    setSubmitting(true);
    setSubmitError(null);
    try {
      let token;
      if (isAuthenticated) {
        token = await getAccessTokenSilently({
          authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
        });
      } else if (customAuth) {
        token = customAuth;
      } else {
        throw new Error('You must be logged in to complete setup.');
      }

      const heightCm = Math.round(parseFloat(heightFeet) * 30.48 + parseFloat(heightInches) * 2.54);
      const toGrams = (val, unit) =>
        unit === 'lb' ? Math.round(parseFloat(val) * 453.592) : Math.round(parseFloat(val) * 1000);
      // POST /users/register
      const clientRes = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          DOB: null,
          height: heightCm || null,
          weight: toGrams(currentWeight, weightUnit) || null,
          goal_weight: toGrams(goalWeight, weightUnit) || null,
          sex: null,
          goal_type_ids: selectedGoalTypeId ? [selectedGoalTypeId] : [],
        }),
      });
      if (!clientRes.ok && clientRes.status !== 409) {
        const err = await clientRes.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to save client profile.');
      }

      // POST /coaches/register (coach only)
      if (role === 'coach') {
        const yearsMap = {
          'Less than 1 year': 0,
          '1 - 2 years': 1,
          '3 - 5 years': 3,
          '5 - 10 years': 5,
          '10+ years': 10,
        };
        const dayMap = { Mon: 'MON', Tue: 'TUE', Wed: 'WED', Thu: 'THU', Fri: 'FRI', Sat: 'SAT', Sun: 'SUN' };
        const coachRes = await fetch(`${API_BASE_URL}/coaches/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            gender: 'Other',
            hourly_rate: parseFloat(hourlyRate) || 0,
            is_trainer: specializations.includes('Workout Coach') || specializations.includes('Both'),
            is_nutritionist: specializations.includes('Nutritionist') || specializations.includes('Both'),
            bio: bio || null,
            years_of_experience: yearsMap[yearsExperience] ?? null,
            max_clients: parseInt(maxClients) || null,
            accepting_clients: true,
            certifications: certifications.split(',').map(s => s.trim()).filter(Boolean),
            availability: availableDays.map(day => ({
              day_of_week: dayMap[day],
              start_time: to24Hour(startTime),
              end_time: to24Hour(endTime),
            })),
            session_format: sessionFormat,
            specialty_goal_type_ids: [],
          }),
        });
        if (!coachRes.ok && coachRes.status !== 409) {
          const err = await coachRes.json().catch(() => ({}));
          throw new Error(err.detail || 'Failed to save coach profile.');
        }
      }

      navigate(role === 'coach' ? '/coach-dashboard' : '/client-dashboard');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
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
