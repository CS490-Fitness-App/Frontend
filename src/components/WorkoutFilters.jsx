import React from "react";
import "./CoachFilters.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faSolidStar } from "@fortawesome/free-solid-svg-icons";
import { faPersonRunning, faUtensils, faX } from "@fortawesome/free-solid-svg-icons";

export const WorkoutFilters = ({ filters, setFilters }) => {
    const update = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }))
    }

    return (
        <div className="filters-exercise">
            <input
                className="search-bar"
                type="text"
                placeholder="Search workouts..."
                value={filters.name}
                onChange={(e) => update("name", e.target.value)}
            />
            
            <div className="filter-column">
                <select
                    className="selection-filter"
                    value={filters.goal_type_id}
                    onChange={(e) => update("goal_type_id", e.target.value)}
                >
                    <option value="">Goal Types</option>
                    <option value="1">Lose Weight</option>
                    <option value="2">Build Muscle</option>
                    <option value="3">Improve Endurance</option>
                    <option value="4">Stay Healthy</option>
                </select>

                <select
                    className="selection-filter"
                    value={filters.experience_level_id}
                    onChange={(e) => update("experience_level_id", e.target.value)}
                >
                    <option value="">All Levels</option>
                    <option value="1">Beginner</option>
                    <option value="2">Intermediate</option>
                    <option value="3">Advanced</option>
                </select>
            </div>
        </div>
    )
}