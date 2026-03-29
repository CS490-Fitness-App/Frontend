import "./ViewExercise.css"
import React from 'react'

import { MdCancel } from "react-icons/md";
import { MdFitnessCenter } from "react-icons/md";

export const ViewExercise = ({ isOpen, onClose, exercise }) => {
    if (!exercise) return null

    return (
        <div>
            <div className={`view-container ${isOpen ? 'open' : ''}`}>
                <div className={`view-content ${isOpen ? 'open' : ''}`}>

                    <MdCancel className="cancel" onClick={onClose} />

                    <h1>{exercise.name}</h1>

                    {/* Stats Row */}
                    <div className="stats-row">
                        <div className="stat-card">
                            <div className="stats-icon"><MdFitnessCenter /></div>
                            <h5>Experience Level</h5>
                            <div className="stat-border">
                                <p className="stat">{exercise.experience_level || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stats-icon"><MdFitnessCenter /></div>
                            <h5>Exercise Type</h5>
                            <div className="stat-border">
                                <p className="stat">{exercise.category || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stats-icon"><MdFitnessCenter /></div>
                            <h5>Equipment Required</h5>
                            <div className="stat-border">
                                <p className="stat">{exercise.equipment || 'None'}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stats-icon"><MdFitnessCenter /></div>
                            <h5>Muscle Groups</h5>
                            <div className="stat-border">
                                <p className="stat">
                                    {exercise.muscle_groups && exercise.muscle_groups.length > 0
                                        ? exercise.muscle_groups.join(', ')
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
