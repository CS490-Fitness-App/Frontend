import "./ViewCoach.css"
import React, { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useCustomAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../utils/apiBaseUrl'

import { MdCancel } from "react-icons/md"
import { MdFitnessCenter } from "react-icons/md"
const renderStars = (rating = 0) => {
    const safeRating = Math.max(0, Math.min(5, Number(rating) || 0))
    return (
        <span className="review-stars" aria-label={`${safeRating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map(n => (
                <span key={n} className={`review-star ${n <= safeRating ? 'filled' : ''}`}>
                    ★
                </span>
            ))}
        </span>
    )
}

export const ViewCoach = ({ isOpen, onClose, coach }) => {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0()
    const { customAuth, userRole } = useCustomAuth()

    const [requestStatus, setRequestStatus] = useState(null)
    const [requestError, setRequestError] = useState('')

    const [reviews, setReviews] = useState([])
    const [myReview, setMyReview] = useState(null)
    const [formRating, setFormRating] = useState(0)
    const [formDescription, setFormDescription] = useState('')
    const [formError, setFormError] = useState('')
    const [formSubmitting, setFormSubmitting] = useState(false)
    const [contractAllowed, setContractAllowed] = useState(false)

    const isLoggedIn = isAuthenticated || !!customAuth
    const isClient = userRole === 'client'

    const getToken = async () => {
        if (isAuthenticated) {
            return getAccessTokenSilently({
                authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
            })
        }
        return customAuth
    }

    useEffect(() => {
        setRequestStatus(null)
        setRequestError('')
        setReviews([])
        setMyReview(null)
        setFormRating(0)
        setFormDescription('')
        setFormError('')
        setContractAllowed(false)

        if (!coach?.coach_id) return

        fetch(`${API_BASE_URL}/coaches/${coach.coach_id}/reviews`)
            .then(r => r.ok ? r.json() : [])
            .then(data => setReviews(Array.isArray(data) ? data : []))
            .catch(() => {})

        if (isLoggedIn && isClient) {
            getToken().then(token => {
                if (!token) return
                fetch(`${API_BASE_URL}/coaches/${coach.coach_id}/reviews/can-review`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                    .then(r => r.ok ? r.json() : { allowed: false })
                    .then(data => setContractAllowed(data.allowed))
                    .catch(() => {})
            })
        }
    }, [coach?.coach_id])

    if (!coach) return null

    const handleRequestCoach = async () => {
        setRequestStatus('sending')
        setRequestError('')
        try {
            const token = await getToken()
            if (!token) throw new Error('You must be logged in to request a coach.')

            const res = await fetch(`${API_BASE_URL}/coaches/request?coach_id=${coach.coach_id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                if (res.status === 402) {
                    throw new Error('A payment method is required before requesting a coach. Please add one in your account settings.')
                }
                throw new Error(err.detail || 'Failed to send coaching request.')
            }
            setRequestStatus('success')
        } catch (err) {
            setRequestStatus('error')
            setRequestError(err.message)
        }
    }

    const handleSubmitReview = async () => {
        if (formRating === 0) {
            setFormError('Please select a star rating.')
            return
        }
        setFormSubmitting(true)
        setFormError('')
        try {
            const token = await getToken()
            const method = myReview ? 'PUT' : 'POST'
            const url = myReview
                ? `${API_BASE_URL}/coaches/${coach.coach_id}/reviews/${myReview.review_id}`
                : `${API_BASE_URL}/coaches/${coach.coach_id}/reviews`

            const res = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rating: formRating, description: formDescription || null }),
            })

            if (res.status === 201 || res.status === 200) {
                const saved = await res.json()
                if (myReview) {
                    setReviews(prev => prev.map(r => r.review_id === saved.review_id ? saved : r))
                } else {
                    setReviews(prev => [saved, ...prev])
                }
                setMyReview(saved)
            } else if (res.status === 409) {
                setFormError("You've already reviewed this coach.")
            } else if (res.status === 403) {
                setContractAllowed(false)
            } else if (res.status === 422) {
                const err = await res.json().catch(() => ({}))
                setFormError(err.detail || 'Your review was flagged for policy violations.')
            } else {
                const err = await res.json().catch(() => ({}))
                setFormError(err.detail || 'Failed to submit review.')
            }
        } catch {
            setFormError('Something went wrong. Please try again.')
        } finally {
            setFormSubmitting(false)
        }
    }

    const handleDeleteReview = async () => {
        if (!myReview) return
        setFormSubmitting(true)
        try {
            const token = await getToken()
            const res = await fetch(
                `${API_BASE_URL}/coaches/${coach.coach_id}/reviews/${myReview.review_id}`,
                { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
            )
            if (res.ok) {
                setReviews(prev => prev.filter(r => r.review_id !== myReview.review_id))
                setMyReview(null)
                setFormRating(0)
                setFormDescription('')
                setFormError('')
            }
        } catch {}
        finally { setFormSubmitting(false) }
    }

    const specializationLabel = () => {
        if (coach.is_trainer && coach.is_nutritionist) return 'Trainer & Nutritionist'
        if (coach.is_trainer) return 'Trainer'
        if (coach.is_nutritionist) return 'Nutritionist'
        return 'N/A'
    }

    const parseAvailSlot = (s) => {
        const [day, times] = s.split(' ')
        const [start, end] = times.split('-')
        const fmt = (t) => {
            const [h, m] = t.split(':')
            const hour = parseInt(h)
            return `${hour % 12 || 12}:${m} ${hour < 12 ? 'AM' : 'PM'}`
        }
        return { day, hours: `${fmt(start)} – ${fmt(end)}` }
    }

    return (
        <div>
            <div className={`coach-view-container ${isOpen ? 'open' : ''}`}>
                <div className={`coach-view-content ${isOpen ? 'open' : ''}`}>

                    <MdCancel className="cancel" onClick={onClose} />

                    <h1>{coach.first_name} {coach.last_name}</h1>

                    <div className="coach-stats-row">
                        <div className="coach-stat-card">
                            <div className="coach-stats-icon"><MdFitnessCenter /></div>
                            <h5>Hourly Rate</h5>
                            <div className="coach-stat-border">
                                <p className="coach-stat">${coach.hourly_rate ?? 'N/A'}</p>
                            </div>
                        </div>
                        <div className="coach-stat-card">
                            <div className="coach-stats-icon"><MdFitnessCenter /></div>
                            <h5>Specialization</h5>
                            <div className="coach-stat-border">
                                <p className="coach-stat">{specializationLabel()}</p>
                            </div>
                        </div>
                        <div className="coach-stat-card">
                            <div className="coach-stats-icon"><MdFitnessCenter /></div>
                            <h5>Avg Rating</h5>
                            <div className="coach-stat-border">
                                <p className="coach-stat">
                                    {coach.avg_rating != null ? `${coach.avg_rating.toFixed(1)} ★` : 'No ratings yet'}
                                </p>
                            </div>
                        </div>
                        <div className="coach-stat-card">
                            <div className="coach-stats-icon"><MdFitnessCenter /></div>
                            <h5>Years of Experience</h5>
                            <div className="coach-stat-border">
                                <p className="coach-stat">
                                    {coach.years_of_experience != null ? coach.years_of_experience : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {coach.bio && <p style={{ margin: '1rem 0' }}>{coach.bio}</p>}

                    {coach.availability && coach.availability.length > 0 && (
                        <div className="coach-availability">
                            <div className="coach-avail-heading">Availability</div>
                            <div className="coach-avail-slots">
                                {coach.availability.map((s, i) => {
                                    const { day, hours } = parseAvailSlot(s)
                                    return (
                                        <div key={i} className="coach-avail-slot">
                                            <span className="coach-avail-day">{day}</span>
                                            <span className="coach-avail-hours">{hours}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {(isAuthenticated || customAuth) && (
                        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <p className="feedback-msg error" style={{ visibility: requestStatus === 'error' ? 'visible' : 'hidden' }}>{requestError || ' '}</p>
                            {requestStatus === 'success' ? (
                                <p className="feedback-msg success">Request sent successfully!</p>
                            ) : (
                                <button
                                    className="btn-periwinkle"
                                    onClick={handleRequestCoach}
                                    disabled={requestStatus === 'sending'}
                                >
                                    {requestStatus === 'sending' ? 'SENDING...' : 'REQUEST COACH'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Reviews */}
                    <div className="coach-reviews-section">
                        <h3 className="reviews-heading">Reviews</h3>

                        {reviews.length === 0 ? (
                            <p className="no-reviews">No reviews yet.</p>
                        ) : (
                            reviews.map(r => (
                                <div key={r.review_id} className={`review-item ${myReview?.review_id === r.review_id ? 'my-review' : ''}`}>
                                    <div className="review-stars-row">
                                        {renderStars(r.rating)}
                                        {r.client_name && <span className="review-author">{r.client_name}</span>}
                                        {myReview?.review_id === r.review_id && (
                                            <button
                                                className="review-delete-btn"
                                                onClick={handleDeleteReview}
                                                disabled={formSubmitting}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                    {r.description && <p className="review-description">{r.description}</p>}
                                </div>
                            ))
                        )}

                        {isLoggedIn && isClient && contractAllowed && (
                            <div className="review-form">
                                <h4 className="review-form-heading">
                                    {myReview ? 'Edit Your Review' : 'Leave a Review'}
                                </h4>
                                <div className="star-picker">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <span
                                            key={n}
                                            className={`review-star interactive ${n <= formRating ? 'filled' : ''}`}
                                            onClick={() => setFormRating(n)}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <textarea
                                    className="review-textarea"
                                    value={formDescription}
                                    onChange={e => setFormDescription(e.target.value)}
                                    placeholder="Write your review (optional)..."
                                    rows={3}
                                />
                                {formError && <p className="feedback-msg error">{formError}</p>}
                                <button
                                    className="btn-periwinkle"
                                    onClick={handleSubmitReview}
                                    disabled={formSubmitting || formRating === 0}
                                >
                                    {formSubmitting ? 'Submitting...' : myReview ? 'Update Review' : 'Submit Review'}
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}

