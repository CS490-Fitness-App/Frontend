import "./ViewExercise.css"
import React from 'react'

import { MdCancel } from "react-icons/md";
import { MdFitnessCenter } from "react-icons/md";
import { FaRegStar } from "react-icons/fa6";

export const ViewExercise = ({ isOpen, onClose, exercises }) => {
    
    //if (!exercise) return null
    //temporary for testing
    const exercise = exercises || {
        name: 'Dumbbell Shoulder Press',
        experience_level: 'Beginner',
        category: 'Strength',
        equipment: 'Dumbbells',
        muscle_groups: ['Shoulders', 'Triceps'],
        instructions: 'Make sure you are in an open area and can move around without hitting anything. Stand upright, leaning slightly forward holding the dumbbells with your palms facing inwards. Raise the dumbbells out to your sides until they reach shoulder height, keeping your elbows slightly bent. Lower your arms and repeat',
        tips: 'Focus more on working the muscle and not on a large amount of weight. If you feel like you are working your forearms more than your shoulders, focus on picking up your elbows while lifting the dumbbells.',
        image_url: 'https://picsum.photos/300/200',
        video_url: 'https://www.youtube.com/watch?v=H38ach0TmWM'
    };

    return (
        <div>
            <div className={`view-container ${isOpen ? 'open' : ''}`}>
                <div className={`view-content ${isOpen ? 'open' : ''}`}>

                    <MdCancel className="cancel" onClick={onClose} />

                    <div className="header-section">
                        <h3 className="view-header">{exercise.name}</h3>
                        <FaRegStar />
                    </div>

                    <div className="btn">Add to workout plan</div>

                    {/* Stats Row */}
                    <div className="stats-row">
                        <div className="stat-card">
                            <h5>Experience Level</h5>
                            <div className="stat-border">
                                <p className="statistic">{exercise.experience_level || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <h5>Exercise Type</h5>
                            <div className="stat-border">
                                <p className="statistic">{exercise.category || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <h5>Equipment Required</h5>
                            <div className="stat-border">
                                <p className="statistic">{exercise.equipment || 'None'}</p>
                            </div>
                        </div>
                        
                    </div>

                    <div className="stats-row">
                        <div className="stat-card">
                            <div className="stats-icon"><MdFitnessCenter /></div>
                            <h4>Muscle Groups</h4>
                            <div className="stat-border">
                                <p className="statistic">
                                    {exercise.muscle_groups && exercise.muscle_groups.length > 0
                                        ? exercise.muscle_groups.join(', ')
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <h4>Instructions</h4>
                            <p>{exercise.instructions}</p>
                            <h4>Tips</h4>
                            <p>{exercise.tips}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
