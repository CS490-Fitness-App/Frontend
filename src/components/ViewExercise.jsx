import "./ViewExercise.css"
import React from 'react'

import { MdCancel } from "react-icons/md";
import { MdFitnessCenter } from "react-icons/md";

export const ViewExercise = ({ isOpen, onClose }) => {
    return (
        <div>
            <div className={`view-container ${isOpen ? 'open' : ''}`}>
                <div className={`view-content ${isOpen ? 'open' : ''}`}>

                    <MdCancel className="cancel" onClick={onClose} />

                    <h1>Dumbbell Lateral Raise</h1>

                    {/* Stats Row */}
                    <div className="stats-row">
                        <div className="stat-card">
                            <div className="stats-icon">
                                <MdFitnessCenter />
                            </div>
                            <h5>Experience Level</h5>
                            <div className="stat-border">
                                <p className="stat">Beginner</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stats-icon">
                                <MdFitnessCenter />
                            </div>
                            <h5>Exercise Type</h5>
                            <div className="stat-border">
                                <p className="stat">Strength</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stats-icon">
                                <MdFitnessCenter />
                            </div>
                            <h5>Equipment Required</h5>
                            <div className="stat-border">
                                <p className="stat">Dumbbell</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stats-icon">
                                <MdFitnessCenter />
                            </div>
                            <h5>Mechanics</h5>
                            <div className="stat-border">
                                <p className="stat">Isolation</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stats-icon">
                                <MdFitnessCenter />
                            </div>
                            <h5>Force Type</h5>
                            <div className="stat-border">
                                <p className="stat">Pull</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
        
    )
}