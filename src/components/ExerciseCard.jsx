import "./ExerciseCard.css"
import React from 'react'
import { Link } from 'react-router-dom' 

export const ExerciseCard = ({ name, level, onClick }) => {
    return (
        <div className="card-container" name={name} onClick={onClick} style={{ cursor: 'pointer' }}>
            <img className="card-img" src="https://picsum.photos/300/200" alt="Exercise Image" />
            <div className={`card-tag card-tag-${level.toLowerCase()}`}>
                {level}
            </div>
            <h2 className="card-title">{name}</h2>

            {/*<Link className="card-btn" onClick={(e) => { e.preventDefault(); onClick() }}>View Exercise</Link>*/}
            <Link className="card-btn">View Exercise</Link>
        </div>
    )
}