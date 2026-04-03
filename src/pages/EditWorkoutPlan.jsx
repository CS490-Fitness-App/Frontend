import "./Pages.css"
import "./ViewWorkout.css"
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import { MdDragHandle } from "react-icons/md";

export const EditWorkout = () => {

    const [workoutName, setWorkoutName] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('');
    const [fitnessGoal, setFitnessGoal] = useState('');
    const [equipmentRequired, setEquipmentRequired] = useState('');
    const [workoutTime, setWorkoutTime] = useState('');
    const [workoutDuration, setWorkoutDuration] = useState('');

    const [exercises, setExercises] = useState([
        { exercise_id: 1, exercise: 'Pushups', sets: '3', reps: '10', rest: '60' },
        { exercise_id: 2, exercise: 'Squats', sets: '3', reps: '12', rest: '90' },
        { exercise_id: 3, exercise: 'Plank', sets: '3', reps: '30', rest: '45' },
    ]);

    const [dragIndex, setDragIndex] = useState(null);

    const handleDragStart = (index) => {
        setDragIndex(index)
    }

    const handleDragOver = (e) => {
        e.preventDefault();
    }

    const handleDrop = (index) => {
        const newItems = [...exercises];
        const draggedItem = newItems[dragIndex];
        newItems.splice(dragIndex, 1);
        newItems.splice(index, 0, draggedItem);
        setExercises(newItems);
        setDragIndex(null);
    }

    return (
        <div>
            <div className="page-heading">
                <div className="h1">
                    <span className="text-black">Create/ Edit </span>
                    <span className="text-purple">Workout Plan</span>
                </div>
            </div>

            <div className="edit-exercises-container">

                <div className="workout-textbox-container">
                    <div className="form-group full-width">
                        <label className="h3">Workout name:</label>
                        <textarea
                            className="form-input"
                            placeholder="WORKOUT NAME HERE"
                            value={workoutName}
                            onChange={(e) => setWorkoutName(e.target.value)}
                        />
                    </div>
                </div>

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
                        {exercises.map((item, index) => (
                            <tr key={index}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(index)}
                                className={index === dragIndex ? "exercise-row-dragging" : "exercise-row-draggable"} >
                                <td>{item.exercise}</td>
                                <td>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={item.sets}
                                            onChange={(e) => item.setSets(e.target.value)}
                                        />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={item.reps}
                                        onChange={(e) => item.setSets(e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={item.rest}
                                        onChange={(e) => item.setSets(e.target.value)}
                                    />
                                </td>
                                <td> <MdDragHandle className="drag-icon"/></td>
                            </tr>
                        ))}
                        <div className="btn">Add new exercise</div>
                    </tbody>
                </table>

                <div className="workout-textbox-container">

                    <div className="edit-workout-group">
                        <label className="h3">Experience Level</label>
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
                    <div className="edit-workout-group">
                        <label className="h3">Fitness Goal</label>
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
                    <div className="edit-workout-group">
                        <label className="h3">Equipment Required</label>
                        <div className="pill-selector">
                            {['Dumbbells', 'Body Weight', 'Cable', 'Machine', 'Other'].map((equipment) => (
                                <div
                                    key={equipment}
                                    className={`pill-option ${equipmentRequired === equipment ? 'selected' : ''}`}
                                    onClick={() => setEquipmentRequired(equipment)}
                                >
                                    {equipment}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="edit-workout-group">
                        <div className="edit-workout-dropdown-boxes">
                            <div className="form-group">
                                <label className="h3">Workout Time (Minutes)</label>
                                <select className="form-input" value={workoutTime} onChange={(e) => setWorkoutTime(e.target.value)}>
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="15">15</option>
                                    <option value="25">25</option>
                                    <option value="30">30</option>
                                    <option value="45">45</option>
                                    <option value="60">60</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="h3">Duration (Weeks)</label>
                                <select className="form-input" value={workoutDuration} onChange={(e) => setWorkoutDuration(e.target.value)}>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                                    <option value="7">7</option>
                                    <option value="8">8</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <Link to="/view-workout" className="edit-workout-plan-btn">
                        <div className="btn">Save Workout Plan</div>
                    </Link>

                </div>
            </div>

        </div>
    )
}