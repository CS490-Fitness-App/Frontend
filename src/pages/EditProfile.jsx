import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Pages.css'
import './UserProfile.css'


export const EditProfile = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [heightFeet, setHeightFeet] = useState('5');
    const [heightInches, setHeightInches] = useState('7');
    const [currentWeight, setCurrentWeight] = useState('');
    const [goalWeight, setGoalWeight] = useState('');
    const [weightUnit, setWeightUnit] = useState('lb');
    const [fitnessGoal, setFitnessGoal] = useState('Build Muscle');
    const [selectedGoalTypeId, setSelectedGoalTypeId] = useState(null);
    const [experienceLevel, setExperienceLevel] = useState('Beginner');

    return (
        <div>
            <div className="page-heading">
                <div className="h2">
                    <span className="text-black">Edit My </span>
                    <span className="text-purple">Profile</span>
                </div>
            </div>

            <div className="user-profile-contents">
                <div className="user-header">
                    <div className="user-temp-pfp">AJ</div>
                    <div className="user-content">
                        <div className="user-type">Upload new photo</div>
                        <div className="personal-info-heading">JPG, PNG, MAX 5MB</div>
                    </div>
                </div>

                <div className="user-info-box">
                    <div className="profile-heading">Personal details</div>

                    <div className="form-group2">
                        <label className="form-label">Email</label>
                        <input className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">First name</label>
                            <input className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Last name</label>
                            <input className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        </div>

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

                    <div className="form-group" style={{ marginTop: '24px' }}>
                        <label className="form-label">Fitness Goal</label>
                        <div className="pill-selector">
                            {['Lose Weight', 'Build Muscle', 'Improve Endurance', 'Stay Healthy', 'Other'].map((level) => (
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

                <div className="coach-info-box">
                    <div className="profile-heading">Coach Details</div>

                    <div className="personal-info-grid">
                        <div>
                            <div className="personal-info-heading">Specialization</div>
                            <div className="personal-info">alxjohnson@gmail.com</div>
                        </div>
                        <div>
                            <div className="personal-info-heading">Hourly Rate</div>
                            <div className="personal-info">5' 10"</div>
                        </div>
                        <div>
                            <div className="personal-info-heading">Certificatoins</div>
                            <div className="personal-info">172 lb</div>
                        </div>
                        <div>
                            <div className="personal-info-heading">Years of Experience</div>
                            <div className="personal-info">165 lb</div>
                        </div>
                        <div>
                            <div className="personal-info-heading">Active Clients</div>
                            <div className="personal-info">Build muscle</div>
                        </div>
                        <div>
                            <div className="personal-info-heading">Average Rating</div>
                            <div className="personal-info">Intermediate</div>
                        </div>
                    </div>
                </div>

                <Link to={"/user-profile"} className="edit-profile-btn">
                    <div className="btn">Save details</div>
                </Link>

            </div>
        </div>
    )
}