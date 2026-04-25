import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar as faSolidStar, faStarHalfStroke, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { faStar as faRegularStar } from '@fortawesome/free-regular-svg-icons'
import './TopCoaches.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const renderStars = (rating = 0) => {
    const stars = []
    let remaining = rating
    for (let i = 0; i < 5; i++) {
        if (remaining >= 1) {
            stars.push(<FontAwesomeIcon key={i} icon={faSolidStar} className="tc-star filled" />)
            remaining--
        } else if (remaining > 0) {
            stars.push(<FontAwesomeIcon key={i} icon={faStarHalfStroke} className="tc-star filled" />)
            remaining = 0
        } else {
            stars.push(<FontAwesomeIcon key={i} icon={faRegularStar} className="tc-star" />)
        }
    }
    return stars
}

export const TopCoaches = () => {
    const [coaches, setCoaches] = useState([])
    const [reviews, setReviews] = useState({})   // { coach_id: review_description }
    const [index, setIndex] = useState(0)
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)
    const VISIBLE = 3

    // Track window resize for responsive transform calculation
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Calculate card width based on breakpoint
    const getCardDimensions = () => {
        if (windowWidth <= 480) return { width: 11, gap: 0.8 }
        if (windowWidth <= 768) return { width: 12, gap: 1 }
        if (windowWidth <= 900) return { width: 14, gap: 1.2 }
        if (windowWidth <= 1024) return { width: 15, gap: 1.5 }
        return { width: 17, gap: 1.5 }
    }

    const { width: cardWidth, gap: cardGap } = getCardDimensions()
    const cardTotal = cardWidth + cardGap

    // Fetch top coaches sorted by rating
    useEffect(() => {
        fetch(`${API_BASE_URL}/coaches`)
            .then(res => res.json())
            .then(data => {
                const top = [...data]
                    .sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
                    .slice(0, 6)
                setCoaches(top)
                return top
            })
            .then(top => {
                // Fetch one review per coach in parallel
                Promise.all(
                    top.map(coach =>
                        fetch(`${API_BASE_URL}/coaches/${coach.coach_id}/reviews?limit=1`)
                            .then(res => res.json())
                            .then(data => ({ coach_id: coach.coach_id, review: data[0] || null }))
                            .catch(() => ({ coach_id: coach.coach_id, review: null }))
                    )
                ).then(results => {
                    const map = {}
                    results.forEach(({ coach_id, review }) => {
                        map[coach_id] = review?.description || null
                    })
                    setReviews(map)
                })
            })
            .catch(() => {})
    }, [])

    if (coaches.length === 0) return null

    const maxIndex = Math.max(0, coaches.length - VISIBLE)

    return (
        <div className="top-coaches-section">
            <div className="top-coaches-header">
                <div className="h2">
                    <span className="text-black">Top </span>
                    <span className="text-purple">Coaches</span>
                </div>
                <Link to="/coaches" className="btn">See All Coaches</Link>
            </div>

            <div className="top-coaches-carousel-wrapper">
                <button
                    className="tc-carousel-btn"
                    onClick={() => setIndex(i => Math.max(0, i - 1))}
                    disabled={index === 0}
                    aria-label="Previous"
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>

                <div className="top-coaches-carousel">
                    <div
                        className="top-coaches-track"
                        style={{ transform: `translateX(calc(-${index} * ${cardTotal}rem))` }}
                    >
                        {coaches.map(coach => (
                            <div key={coach.coach_id} className="tc-card">
                                <img
                                    src={coach.profile_picture || `https://picsum.photos/seed/${coach.coach_id}/200/200`}
                                    alt={`${coach.first_name} ${coach.last_name}`}
                                    className="tc-card-img"
                                />
                                <h3 className="tc-card-name">{coach.first_name} {coach.last_name}</h3>

                                <div className="tc-card-stars">
                                    {renderStars(coach.avg_rating)}
                                    <span className="tc-rating-value">
                                        {coach.avg_rating != null ? coach.avg_rating.toFixed(1) : '—'}
                                    </span>
                                </div>

                                <div className="tc-card-tags">
                                    {coach.is_trainer && <span className="tc-tag">Trainer</span>}
                                    {coach.is_nutritionist && <span className="tc-tag">Nutritionist</span>}
                                </div>

                                <p className="tc-card-rate">${coach.hourly_rate ?? 'N/A'}/hr</p>

                                {reviews[coach.coach_id] && (
                                    <blockquote className="tc-card-review">
                                        "{reviews[coach.coach_id]}"
                                    </blockquote>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    className="tc-carousel-btn"
                    onClick={() => setIndex(i => Math.min(maxIndex, i + 1))}
                    disabled={index >= maxIndex}
                    aria-label="Next"
                >
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </div>

            <div className="tc-dots">
                {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                    <span
                        key={i}
                        className={`tc-dot${i === index ? ' active' : ''}`}
                        onClick={() => setIndex(i)}
                    />
                ))}
            </div>
        </div>
    )
}
