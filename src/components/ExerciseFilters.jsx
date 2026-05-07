import React from 'react'
import './Filters.css'

export const ExerciseFilters = ({
    filters,
    setFilters,
    equipmentOptions = [],
    muscleGroups = [],
    categories = [],
    experienceLevels = [],
}) => {
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
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>

            <select
                className="filters-select"
                value={filters.equipment}
                onChange={(e) => update('equipment', e.target.value)}
            >
                <option value="">All Equipment</option>
                {equipmentOptions.map(eq => (
                    <option key={eq} value={eq}>{eq}</option>
                ))}
            </select>

            {muscleGroups.length > 0 && (
                <select
                    className="filters-select"
                    value={filters.muscle_group_id}
                    onChange={(e) => update('muscle_group_id', e.target.value)}
                >
                    <option value="">All Muscle Groups</option>
                    {muscleGroups.map(mg => (
                        <option key={mg.id} value={mg.id}>{mg.name}</option>
                    ))}
                </select>
            )}

            <select
                className="filters-select"
                value={filters.experience_level_id}
                onChange={(e) => update('experience_level_id', e.target.value)}
            >
                <option value="">All Levels</option>
                {experienceLevels.map(level => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                ))}
            </select>
        </div>
    )
}
