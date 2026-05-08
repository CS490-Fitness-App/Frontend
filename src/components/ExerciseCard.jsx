import "./ExerciseCard.css"
import React from 'react'

const levelClass = (level) => {
    switch ((level || '').toLowerCase()) {
        case 'beginner':     return 'card-tag-beginner'
        case 'intermediate': return 'card-tag-intermediate'
        case 'advanced':     return 'card-tag-advanced'
        default:             return 'card-tag-beginner'
    }
}

export const ExerciseCard = ({ exercise, onClick }) => {
    return (
        <div className="card-container" onClick={onClick} style={{ cursor: 'pointer' }}>
            <img
                className="card-img"
                src={exercise.image_url || 'https://picsum.photos/300/200'}
                alt={exercise.name}
            />
            <div className={levelClass(exercise.experience_level)}>{exercise.experience_level || 'N/A'}</div>
            <h2 className="card-title">{exercise.name}</h2>
            <span className="card-btn">View Exercise</span>
        </div>
    )
}
