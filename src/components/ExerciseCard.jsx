import React from 'react'
import { Link } from 'react-router-dom' 

import "./ExerciseCard.css"

export const ExerciseCard = () => {
    return (
        <div className="card-container">
            <img className="card-img" src="https://picsum.photos/300/200" alt="Exercise Image" />
            <div className="card-tag">Beginner</div>
            <h2 className="card-title">Dumbbell Lateral Raise</h2>
            <Link className="card-btn">View Exercise</Link>
        </div>
    )
}