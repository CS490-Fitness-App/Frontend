import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar as faSolidStar } from '@fortawesome/free-solid-svg-icons'
import { faPersonRunning, faUtensils } from '@fortawesome/free-solid-svg-icons'
import './CoachFilters.css'

export const CoachFilters = ({ filters, setFilters }) => {
    const update = (field, value) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    return (
        <div className="coach-filters-wrap">
            <input
                className="coach-filters-search"
                type="text"
                placeholder="Search coaches..."
                value={filters.name}
                onChange={(e) => update('name', e.target.value)}
            />

            <div className="coach-filters-row">
                <div className="coach-filters-number">
                    <label>Min Rate</label>
                    <input
                        className="coach-rate-input"
                        min={0}
                        type="number"
                        value={filters.min_rate}
                        onChange={(e) => update('min_rate', e.target.value)}
                    />
                </div>

                <div className="coach-filters-number">
                    <label>Max Rate</label>
                    <input
                        className="coach-rate-input"
                        min={0}
                        type="number"
                        value={filters.max_rate}
                        onChange={(e) => update('max_rate', e.target.value)}
                    />
                </div>

                <button
                    type="button"
                    className={`coach-filter-icon ${filters.trainer ? 'active' : ''}`}
                    onClick={() => update('trainer', !filters.trainer)}
                    title="Trainer"
                    aria-label="Toggle trainer"
                >
                    <FontAwesomeIcon icon={faPersonRunning} />
                </button>

                <button
                    type="button"
                    className={`coach-filter-icon ${filters.nutritionist ? 'active' : ''}`}
                    onClick={() => update('nutritionist', !filters.nutritionist)}
                    title="Nutritionist"
                    aria-label="Toggle nutritionist"
                >
                    <FontAwesomeIcon icon={faUtensils} />
                </button>

                <select
                    className="coach-filter-select"
                    value={filters.session_format}
                    onChange={(e) => update('session_format', e.target.value)}
                >
                    <option value="">Any Format</option>
                    <option value="Virtual">Virtual</option>
                    <option value="In-Person">In-Person</option>
                    <option value="Both">Both</option>
                </select>

                <select
                    className="coach-filter-select"
                    value={filters.specialty}
                    onChange={(e) => update('specialty', e.target.value)}
                >
                    <option value="">Any Specialty</option>
                    <option value="1">Lose Weight</option>
                    <option value="2">Build Muscle</option>
                    <option value="3">Improve Endurance</option>
                    <option value="4">Stay Healthy</option>
                </select>

                <div className="coach-star-filter">
                    <span>Rating</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="coach-star-btn"
                            onClick={() => update('avg_rating', star === filters.avg_rating ? 0 : star)}
                            aria-label={`Filter by ${star} stars`}
                        >
                            <FontAwesomeIcon
                                icon={faSolidStar}
                                style={{ color: star <= filters.avg_rating ? '#f5b301' : '#c7c7c7' }}
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
