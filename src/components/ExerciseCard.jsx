import React from 'react'
import { Link } from 'react-router-dom' 
import "./ExerciseCard.css"

import { IoIosFitness } from "react-icons/io";

export const ExerciseCard = () => {
    return (
        <div className="card-container">
            <img className="card-img" src="https://picsum.photos/300/200" alt="Exercise Image" />
            <div className="card-tag">Beginner</div>
            <h2 className="card-title">Dumbbell Lateral Raise</h2>

            {/* Stats Row */}
            <div className="block-grid">
                <div className="info-block">
                    <div className="block-icon">
                        <IoIosFitness className="icon" />
                    </div>
                    <p className="text-[10px] uppercase font-mono text-muted-foreground">Status</p>
                    <p className="category">Active</p>
                </div>

                <div className="info-block">
                    <div className="block-icon">
                        <IoIosFitness className="icon" />
                    </div>
                    <p className="text-[10px] uppercase font-mono text-muted-foreground">Participants</p>
                    <p className="category">127</p>
                </div>

                <div className="info-block">
                    <p className="text-[10px] uppercase font-mono text-muted-foreground">Data Points</p>
                    <p className="category">1842</p>
                </div>

                <div className="info-block">
                    <p className="text-[10px] uppercase font-mono text-muted-foreground">Duration</p>
                    <p className="category">6 months</p>
                </div>
            </div>

            <Link className="card-btn">View Exercise</Link>
        </div>
    )
}