import "./ExerciseCard.css"
import React from 'react'

export const ExerciseCard = ({ exercise, onClick }) => {
    return (
        <div className="card-container" onClick={onClick} style={{ cursor: 'pointer' }}>
            <img
                className="card-img"
                src={exercise.image_url || 'https://picsum.photos/300/200'}
                alt={exercise.name}
            />
            <div className="card-tag">{exercise.experience_level || 'N/A'}</div>
            <h2 className="card-title">{exercise.name}</h2>
            <span className="card-btn">View Exercise</span>
        </div>
    )
}
