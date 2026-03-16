import "./ExerciseCard.css"
import React from 'react'
import { Link } from 'react-router-dom' 

export const ExerciseCard = ({ onClick }) => {
    return (
        <div className="card-container" onClick={onClick} style={{ cursor: 'pointer' }}>
            <img className="card-img" src="https://picsum.photos/300/200" alt="Exercise Image" />
            <div className="card-tag">Beginner</div>
            <h2 className="card-title">Dumbbell Lateral Raise</h2>

            {/*<Link className="card-btn" onClick={(e) => { e.preventDefault(); onClick() }}>View Exercise</Link>*/}
            <Link className="card-btn">View Exercise</Link>
        </div>
    )
}