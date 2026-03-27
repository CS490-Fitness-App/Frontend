import "./WorkoutCard.css"
import React from 'react'

export const WorkoutCard = ({ workout, onClick }) => {
    return (
        <div className="workout-card-container" onClick={onClick} style={{ cursor: 'pointer' }}>
            <img className="workout-card-img" src={workout.image_url || "https://picsum.photos/300/200"} alt={workout.name} />
            <div className="workout-card-tag">{workout.experience_level || "All Levels"}</div>
            <h2 className="workout-card-title">{workout.name}</h2>
            <div className="workout-card-meta">
                {workout.goal_type && <span>{workout.goal_type}</span>}
                {workout.workout_time_mins && <span>{workout.workout_time_mins} min</span>}
                {workout.intended_duration_weeks && <span>{workout.intended_duration_weeks}w</span>}
            </div>
            <button className="workout-card-btn">View Workout</button>
        </div>
    )
}
