import "./ViewCoach.css"
import React from 'react'

import { MdCancel } from "react-icons/md";
import { MdFitnessCenter } from "react-icons/md";

export const ViewCoach = ({ isOpen, onClose, coach }) => {
    if (!coach) return null

    return (
        <div>
            <div className={`coach-view-container ${isOpen ? 'open' : ''}`}>
                <div className={`coach-view-content ${isOpen ? 'open' : ''}`}>

                    <MdCancel className="cancel" onClick={onClose} />

                    <h1>Name</h1>

                    {/* Stats Row */}
                    <div className="coach-stats-row">
                        <div className="coach-stat-card">
                            <div className="coach-stats-icon"><MdFitnessCenter /></div>
                            <h5>Experience Level</h5>
                            
                            <div className="coach-stat-border">
                                <p className="coach-stat">{null || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="coach-stat-card">
                            <div className="coach-stats-icon"><MdFitnessCenter /></div>
                            <h5>Exercise Type</h5>
                            <div className="coach-stat-border">
                                <p className="coach-stat">{null || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="coach-stat-card">
                            <div className="coach-stats-icon"><MdFitnessCenter /></div>
                            <h5>Equipment Required</h5>
                            <div className="coach-stat-border">
                                <p className="coach-stat">{null || 'None'}</p>
                            </div>
                        </div>
                        <div className="coach-stat-card">
                            <div className="coach-stats-icon"><MdFitnessCenter /></div>
                            <h5>Muscle Groups</h5>
                            <div className="coach-stat-border">
                                <p className="coach-stat">
                                    words
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
