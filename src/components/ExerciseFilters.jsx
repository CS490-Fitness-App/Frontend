import React from 'react'
import './Filters.css'

export const ExerciseFilters = ({ filters, setFilters }) => {
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
                placeholder="Search exercises..."
                value={filters.name}
                onChange={(e) => update('name', e.target.value)}
            />

            <select
                className="filters-select"
                value={filters.category_id}
                onChange={(e) => update('category_id', e.target.value)}
            >
                <option value="">All Categories</option>
                <option value="1">Strength</option>
                <option value="2">Cardio</option>
                <option value="3">Flexibility</option>
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
