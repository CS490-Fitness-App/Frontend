import "./ViewExercise.css"
import React, { useState } from 'react'

import { MdCancel } from "react-icons/md";
import { MdFitnessCenter } from "react-icons/md";
import { FaRegStar } from "react-icons/fa6";
import { FaStar } from "react-icons/fa6";

//export const ViewExercise = ({ isOpen, onClose, exercise }) => {
export const ViewExercise = ({ isOpen, onClose, exercises }) => {
    
    //if (!exercise) return null
    const [starToggled, setStarToggled] = useState(false)


    //this is just hard coded for testing purposes
    const exercise = exercises || {
        name: 'Dumbbell Shoulder Press',
        experience_level: 'Beginner',
        category: 'Strength',
        equipment: 'Dumbbells',
        muscle_groups: ['Shoulders', 'Triceps'],
        instructions: '1. Make sure you are in an open area and can move around without hitting anything.\n2. Stand upright, leaning slightly forward holding the dumbbells with your palms facing inwards.\n3. Raise the dumbbells out to your sides until they reach shoulder height, keeping your elbows slightly bent.\n4. Lower your arms and repeat',
        tips: 'Focus more on working the muscle and not on a large amount of weight.\nIf you feel like you are working your forearms more than your shoulders, focus on picking up your elbows while lifting the dumbbells.',
        image_url: 'https://picsum.photos/200/150',
        video_url: 'https://www.youtube.com/watch?v=H38ach0TmWM'
    };

    const handleToggle = () => {
        setStarToggled(!starToggled)
    }

    return (
        <div>
            <div className={`view-container ${isOpen ? 'open' : ''}`}>
                <div className={`view-content ${isOpen ? 'open' : ''}`}>

                    <MdCancel className="cancel" onClick={onClose} />

                    <div className="header-section">
                        <h3 className="view-header">{exercise.name}</h3>
                        <button onClick={handleToggle} className="star">
                            {
                                starToggled ?
                                    <FaRegStar /> :
                                    <FaStar />
                            }
                        </button>
                        
                        {/*if u click this star it will save the exercise to your favorites*/}
                    </div>

                    <div className="btn">Add to workout plan</div>

                    {/* Stats Row */}
                    <div className="stats-row">
                        <div className="stat-card">
                            <h5>Experience Level</h5>
                            <div className="stat-border">
                                <div className="statistic">{exercise.experience_level || 'N/A'}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <h5>Exercise Type</h5>
                            <div className="stat-border">
                                <div className="statistic">{exercise.category || 'N/A'}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <h5>Equipment Required</h5>
                            <div className="stat-border">
                                <div className="statistic">{exercise.equipment || 'None'}</div>
                            </div>
                        </div>
                        
                    </div>

                    <div className="stats-row">
                        <div className="stat-card">
                            {/*<div className="stats-icon"><MdFitnessCenter /></div>*/}
                            <h4>Muscle Groups</h4>
                            <div className="stat-border">
                                <div className="statistic">
                                    {exercise.muscle_groups && exercise.muscle_groups.length > 0
                                        ? exercise.muscle_groups.join(', ')
                                        : 'N/A'}
                                </div>
                            </div>
                            <img
                                className="muscle-image"
                                src={exercise.image_url || 'https://picsum.photos/300/200'}
                                alt={exercise.name}
                            />
                        </div>

                        <div className="instructions-card">
                            <h4>Instructions</h4>
                            <p>{exercise.instructions}</p>
                            <h4>Tips</h4>
                            <p>{exercise.tips}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <h4>Video Exercise Guide</h4>
                        <iframe width="500" height="300" margin-bottom="1rem" src="https://www.youtube.com/embed/H38ach0TmWM?si=_8T700qf5QDnit9m" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                    </div>
                </div>
            </div>
        </div>
    )
}
