import React from 'react'
import './Filters.css'

export const WorkoutFilters = ({ filters, setFilters }) => {
    const update = (field, value) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    return (
        <div className="filters-row">
            <input
                className="filters-search"
                type="text"
                placeholder="Search workouts..."
                value={filters.name}
                onChange={(e) => update('name', e.target.value)}
            />

            <select
                className="filters-select"
                value={filters.goal_type_id}
                onChange={(e) => update('goal_type_id', e.target.value)}
            >
                <option value="">Goal Types</option>
                <option value="1">Lose Weight</option>
                <option value="2">Build Muscle</option>
                <option value="3">Improve Endurance</option>
                <option value="4">Stay Healthy</option>
            </select>

            <select
                className="filters-select"
                value={filters.experience_level_id}
                onChange={(e) => update('experience_level_id', e.target.value)}
            >
                <option value="">All Levels</option>
                <option value="1">Beginner</option>
                <option value="2">Intermediate</option>
                <option value="3">Advanced</option>
            </select>
        </div>
    )
}
