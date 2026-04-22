import React from "react";
import "./CoachFilters.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faSolidStar } from "@fortawesome/free-solid-svg-icons";
import { faPersonRunning, faUtensils, faX } from "@fortawesome/free-solid-svg-icons";

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
                className="search-bar"
                type="text"
                placeholder="Search Coaches..."
                value={filters.name}
                onChange={(e) => update("name", e.target.value)}
            />
            <div className="filter-row">

                <div className="filter-number-input">
                    <label>Minimum Rate</label>
                    <input
                        className="number-input"
                        min={0}
                        type="number"
                        value={filters.min_rate}
                        onChange={(e) => update("min_rate", e.target.value)}
                    />
                </div>

                <div className="filter-number-input">
                    <label>Maximum Rate</label>
                    <input
                        className="number-input"
                        min={0}
                        type="number"
                        value={filters.max_rate}
                        onChange={(e) => update("max_rate", e.target.value)}
                    />
                </div>

                <div
                    className={`filter-icon-toggle ${filters.trainer ? "active" : ""}`}
                    onClick={() => update("trainer", !filters.trainer)}
                >
                    <FontAwesomeIcon icon={faPersonRunning} />
                </div>

                <div
                    className={`filter-icon-toggle ${filters.nutritionist ? "active" : ""}`}
                    onClick={() => update("nutritionist", !filters.nutritionist)}
                >
                    <FontAwesomeIcon icon={faUtensils} />
                </div>

                <select
                    className="filter-select"
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
                        >
                            <FontAwesomeIcon
                                icon={faSolidStar}
                                style={{ color: star <= filters.avg_rating ? "gold" : "#ccc" }}
                            />
                        </span>
                    ))}
                </div>

                <select
                    className="filter-select"
                    value={filters.speciality}
                    onChange={(e) => update("specialty", e.target.value)}
                >
                    <option value="">No Specialty</option>
                    <option value="1">Lose Weight</option>
                    <option value="2">Build Muscle</option>
                    <option value="3">Improve Enduarnce</option>
                    <option value="4">Stay Healthy</option>
                </select>
            </div>
        </div>
    )
}