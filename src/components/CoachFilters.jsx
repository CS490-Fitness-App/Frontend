import React from "react";

export const CoachFilters = ({ filters, setFilters }) => {
    const update = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }))
    }

    return (
        <div className="filters">
            <input
                type="text"
                placeholder="Search Coaches..."
                value={filters.name}
                onChange={(e) => update("name", e.target.value)}
            />
            <input
                type="number"
                value={filters.min_rate}
                onChange={(e) => update("min_rate", e.target.value)}
            />
            <input
                type="number"
                value={filters.max_rate}
                onChange={(e) => update("max_rate", e.target.value)}
            />
            <input
                type="checkbox"
                checked={filters.trainer}
                onChange={(e) => update("trainer", e.target.checked)}
            />
            <input
                type="checkbox"
                checked={filters.nutritionist}
                onChange={(e) => update("nutritionist", e.target.checked)}
            />

            <select
                value={filters.session_format}
                onChange={(e) => update("session_format", e.target.value)}
            >
                <option value="">Any Format</option>
                <option value="Virtual">Virtual</option>
                <option value="In-Person">In-Person</option>
            </select>

            <div className="star-filter">
                <span>Rating</span>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className="star-button"
                        onClick={() => update("avg_rating", star === filters.avg_rating ? 0 : star)}
                        style={{ cursor: "pointer", color: star <= filters.avg_rating ? "black" : "gray" }}
                    >
                        ★
                    </span>
                ))}
            </div>

            <select
                value={filters.speciality}
                onChange={(e) => update("specialty", e.target.value)}
            >
                <option value="">Any Format</option>
                <option value="1">Lose Weight</option>
                <option value="2">Build Muscle</option>
                <option value="3">Improve Enduarnce</option>
                <option value="4">Stay Healthy</option>
            </select>
        </div>
    )
}