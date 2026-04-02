import "./Pages.css"
import "./ViewWorkout.css"
import React, { useState } from 'react'

import { FaRegStar } from "react-icons/fa6";
import { FaStar } from "react-icons/fa6";

export const ViewWorkout = () => {

    const [starToggled, setStarToggled] = useState(false)

    const handleToggle = () => {
        setStarToggled(!starToggled)
    }

    const workout = {
        name: 'Core Conditioning',
        experience_level: 'Beginner',
        goal: 'General Fitness',
        equipment: 'bodyweight',
        workout_time: 15,
        duration: 8,
        image_url: 'https://picsum.photos/200/150',
        video_url: 'https://www.youtube.com/watch?v=H38ach0TmWM'
    };

    return (
        <div>
            <div className="page-heading">
                <h1 className="h1">{workout.name}</h1>
                <button onClick={handleToggle} className="workout-star">
                    { starToggled ? <FaStar /> : <FaRegStar /> }
                </button>
                {/*if u click this star it will save the exercise to your favorites*/}
            </div>

            <div className="stats-row">
                <div className="stat-card">
                    <h5 className="workout-h5">Experience Level</h5>
                    <div className="stat-border">
                        <div className="statistic">{workout.experience_level || 'N/A'}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <h5 className="workout-h5">Exercise Type</h5>
                    <div className="stat-border">
                        <div className="statistic">{workout.goal || 'N/A'}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <h5 className="workout-h5">Equipment Required</h5>
                    <div className="stat-border">
                        <div className="statistic">{workout.equipment || 'None'}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <h5 className="workout-h5">Workout Time</h5>
                    <div className="stat-border">
                        <div className="statistic">{workout.workout_time || 'None'} minutes</div>
                    </div>
                </div>
                <div className="stat-card">
                    <h5 className="workout-h5">Intended Duration</h5>
                    <div className="stat-border">
                        <div className="statistic">{workout.duration || 'None'} weeks</div>
                    </div>
                </div>

            </div>

            {/* note: should be able click on each exercise and it will bring up the view exercise popup */ }
            <table className="workout-table">
                <thead>
                    <tr>
                        <th>Exercise</th>
                        <th>Sets</th>
                        <th>Reps</th>
                        <th>Rest</th>
                    </tr>
                </thead>
                <tbody>
                    {/* 
                    {workout.exercises.map((item) => (
                        <tr key={item.exercise_id}>
                            <td>{item.exercise}</td>
                            <td>{item.sets}</td>
                            <td>{item.reps}</td>
                            <td>{item.rest}</td>
                        </tr>
                    ))}*/}
                    <tr className="workout-exercise-row">
                        <td className="exercise-row-first">Dumbbell Exercise</td>
                        <td>30</td>
                        <td>30</td>
                        <td className="exercise-row-last">30</td>
                    </tr>
                    <tr className="workout-exercise-row">
                        <td className="exercise-row-first">Dumbbell Exercise 2</td>
                        <td>30</td>
                        <td>30</td>
                        <td className="exercise-row-last">30</td>
                    </tr>
                </tbody>
            </table>

        </div>
    )
}