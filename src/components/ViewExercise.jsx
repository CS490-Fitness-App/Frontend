import "./ViewExercise.css"
import React from 'react'

import { MdCancel } from "react-icons/md";
import { MdFitnessCenter } from "react-icons/md";

export const ViewExercise = ({ isOpen, onClose, name, level, type, equipment, muscleGroups }) => {
    return (
        <div>
            <div className={`view-container ${isOpen ? 'open' : ''}`}>
                <div className={`view-content ${isOpen ? 'open' : ''}`}>

                    <MdCancel className="cancel" onClick={onClose} />

                    <h1>{name}</h1>

                    {/* Stats Row */}
                    <div className="stats-row">
                        <div className="stat-card">
                            <div className="stats-icon">
                                <MdFitnessCenter />
                            </div>
                            <h5>Experience Level</h5>
                            
                            <div className="stat-border">
                                <p className="stat">{level}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stats-icon">
                                <MdFitnessCenter />
                            </div>
                            <h5>Type</h5>
                            <div className="stat-border">
                                <p className="stat">{type}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stats-icon">
                                <MdFitnessCenter />
                            </div>
                            <h5>Equipment</h5>
                            <div className="stat-border">
                                <p className="stat">Bench</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stats-icon">
                                <MdFitnessCenter />
                            </div>
                            <h5>Muscle Groups</h5>
                            <div className="stat-border">
                                <p className="stat">Isolation</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
        
    )
}