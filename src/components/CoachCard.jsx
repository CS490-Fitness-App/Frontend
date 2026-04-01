import "./CoachCard.css"
import React from 'react'

export const CoachCard = ({ coach, onClick }) => {
    return (
        <div className="card-container" onClick={onClick} style={{ cursor: 'pointer' }}>
            <img
                className="card-img"
                src={coach.profile_picture || 'https://picsum.photos/300/200'}
                alt={coach.first_name}
            />
            <div className="card-tag">{null || 'N/A'}</div>
            <h2 className="card-title">{null || "N/A"}</h2>
            <span className="card-btn">View Coach Profile</span>
        </div>
    )
}
