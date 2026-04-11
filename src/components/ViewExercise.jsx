import "./ViewExercise.css"
import React, { useState } from 'react'

import { MdCancel } from "react-icons/md"
import { FaRegStar } from "react-icons/fa6"
import { FaStar } from "react-icons/fa6"

// Convert any YouTube watch/short URL to an embed URL.
// Returns null if the URL is missing or not a recognisable YouTube link.
const toYouTubeEmbed = (url) => {
    if (!url) return null
    try {
        const u = new URL(url)
        let videoId = null
        if (u.hostname === 'youtu.be') {
            videoId = u.pathname.slice(1)
        } else if (u.hostname.includes('youtube.com')) {
            videoId = u.searchParams.get('v')
        }
        if (!videoId) return null
        return `https://www.youtube.com/embed/${videoId}`
    } catch {
        return null
    }
}

export const ViewExercise = ({ isOpen, onClose, exercise }) => {
    const [starToggled, setStarToggled] = useState(false)

    if (!exercise) return null

    const embedUrl = toYouTubeEmbed(exercise.video_url)

    return (
        <div>
            <div className={`view-container ${isOpen ? 'open' : ''}`}>
                <div className={`view-content ${isOpen ? 'open' : ''}`}>

                    <MdCancel className="cancel" onClick={onClose} />

                    <div className="header-section">
                        <h3 className="view-header">{exercise.name}</h3>
                        <button onClick={() => setStarToggled(!starToggled)} className="star">
                            {starToggled ? <FaRegStar /> : <FaStar />}
                        </button>
                    </div>

                    <div className="btn">Add to workout plan</div>

                    {/* Stats Row */}
                    <div className="stats-row">
                        <div className="stat-card">
                            <h5>Experience Level</h5>
                            <div className="stat-border">
                                <div className="statistic">{exercise.experience_level || 'N/A'}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <h5>Exercise Type</h5>
                            <div className="stat-border">
                                <div className="statistic">{exercise.category || 'N/A'}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <h5>Equipment Required</h5>
                            <div className="stat-border">
                                <div className="statistic">{exercise.equipment || 'None'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="stats-row">
                        <div className="stat-card">
                            <h4>Muscle Groups</h4>
                            <div className="stat-border">
                                <div className="statistic">
                                    {exercise.muscle_groups && exercise.muscle_groups.length > 0
                                        ? exercise.muscle_groups.join(', ')
                                        : 'N/A'}
                                </div>
                            </div>
                            {exercise.image_url && (
                                <img
                                    className="muscle-image"
                                    src={exercise.image_url}
                                    alt={exercise.name}
                                />
                            )}
                        </div>

                        <div className="instructions-card">
                            <h4>Instructions</h4>
                            <p>{exercise.instructions || 'No instructions available.'}</p>
                            {exercise.tips && (
                                <>
                                    <h4>Tips</h4>
                                    <p>{exercise.tips}</p>
                                </>
                            )}
                        </div>
                    </div>

                    {embedUrl && (
                        <div className="stat-card">
                            <h4>Video Exercise Guide</h4>
                            <iframe
                                width="500"
                                height="300"
                                src={embedUrl}
                                title={`${exercise.name} video guide`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
