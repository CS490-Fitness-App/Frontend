import React, { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useCustomAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../utils/apiBaseUrl'
import './CoachActions.css'

export const CoachActions = ({ coachId, coachName, onCoachFired }) => {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0()
    const { customAuth } = useCustomAuth()

    const [isReviewOpen, setIsReviewOpen] = useState(false)
    const [isFireOpen, setIsFireOpen] = useState(false)
    const [isReportOpen, setIsReportOpen] = useState(false)

    const [reviewRating, setReviewRating] = useState(0)
    const [reviewHover, setReviewHover] = useState(0)
    const [reviewText, setReviewText] = useState('')
    const [myReview, setMyReview] = useState(null)
    const [reviewAllowed, setReviewAllowed] = useState(true)
    const [reviewSubmitting, setReviewSubmitting] = useState(false)
    const [reviewMessage, setReviewMessage] = useState('')
    const [reviewError, setReviewError] = useState('')

    const [fireSubmitting, setFireSubmitting] = useState(false)
    const [fireError, setFireError] = useState('')

    const [reportReason, setReportReason] = useState('Inappropriate behavior')
    const [reportDetails, setReportDetails] = useState('')
    const [reportSubmitting, setReportSubmitting] = useState(false)
    const [reportMessage, setReportMessage] = useState('')
    const [reportError, setReportError] = useState('')

    const getToken = async () => {
        if (isAuthenticated) {
            return getAccessTokenSilently({
                authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
            })
        }
        if (customAuth) return customAuth
        throw new Error('Not authenticated')
    }

    useEffect(() => {
        const loadReviewState = async () => {
            if (!coachId) return

            try {
                const token = await getToken()
                const [canReviewResponse, myReviewResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/coaches/${coachId}/reviews/can-review`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_BASE_URL}/coaches/${coachId}/reviews/mine`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ])

                const canReviewData = canReviewResponse.ok
                    ? await canReviewResponse.json()
                    : { allowed: false }
                setReviewAllowed(!!canReviewData.allowed)

                const reviewData = myReviewResponse.ok
                    ? await myReviewResponse.json()
                    : null

                if (reviewData) {
                    setMyReview(reviewData)
                    setReviewRating(reviewData.rating || 0)
                    setReviewText(reviewData.description || '')
                } else {
                    setMyReview(null)
                    setReviewRating(0)
                    setReviewText('')
                }
            } catch {
                setReviewAllowed(false)
            }
        }

        loadReviewState()
    }, [coachId])

    const handleSubmitReview = async (e) => {
        e.preventDefault()
        if (reviewRating === 0) {
            setReviewError('Please select a star rating.')
            return
        }

        setReviewSubmitting(true)
        setReviewError('')
        setReviewMessage('')

        try {
            const token = await getToken()
            const method = myReview ? 'PUT' : 'POST'
            const endpoint = myReview
                ? `${API_BASE_URL}/coaches/${coachId}/reviews/${myReview.review_id}`
                : `${API_BASE_URL}/coaches/${coachId}/reviews`

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    rating: reviewRating,
                    description: reviewText,
                }),
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.detail || 'Failed to submit review.')
            }

            const savedReview = await response.json().catch(() => null)
            if (savedReview) {
                setMyReview(savedReview)
                setReviewRating(savedReview.rating || 0)
                setReviewText(savedReview.description || '')
            }

            setReviewMessage(myReview ? 'Review updated!' : 'Review submitted!')
            setTimeout(() => {
                setIsReviewOpen(false)
                setReviewMessage('')
            }, 1000)
        } catch (err) {
            setReviewError(err.message)
        } finally {
            setReviewSubmitting(false)
        }
    }

    const handleDeleteReview = async () => {
        if (!myReview) return

        setReviewSubmitting(true)
        setReviewError('')
        setReviewMessage('')

        try {
            const token = await getToken()
            const response = await fetch(`${API_BASE_URL}/coaches/${coachId}/reviews/${myReview.review_id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.detail || 'Failed to delete review.')
            }

            setMyReview(null)
            setReviewRating(0)
            setReviewText('')
            setReviewMessage('Review deleted.')
        } catch (err) {
            setReviewError(err.message)
        } finally {
            setReviewSubmitting(false)
        }
    }

    const handleFireCoach = async () => {
        setFireSubmitting(true)
        setFireError('')

        try {
            const token = await getToken()
            const response = await fetch(`${API_BASE_URL}/coaches/contract/end?other_user_id=${coachId}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.detail || 'Failed to fire coach.')
            }

            setIsFireOpen(false)
            if (onCoachFired) onCoachFired()
        } catch (err) {
            setFireError(err.message)
        } finally {
            setFireSubmitting(false)
        }
    }

    const handleSubmitReport = async (e) => {
        e.preventDefault()
        setReportSubmitting(true)
        setReportError('')
        setReportMessage('')

        try {
            const token = await getToken()
            const response = await fetch(`${API_BASE_URL}/coaches/${coachId}/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    reason: reportReason,
                    details: reportDetails,
                }),
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.detail || 'Failed to submit report.')
            }

            setReportMessage('Report submitted. Thank you.')
            setTimeout(() => {
                setIsReportOpen(false)
                setReportReason('Inappropriate behavior')
                setReportDetails('')
                setReportMessage('')
            }, 1000)
        } catch (err) {
            setReportError(err.message)
        } finally {
            setReportSubmitting(false)
        }
    }

    if (!coachId) return null

    return (
        <>
            <div className="coach-actions-row">
                <button type="button" className="panel-btn-purple" onClick={() => setIsReviewOpen(true)}>
                    {myReview ? 'Edit Review' : 'Review Coach'}
                </button>
                <button type="button" className="panel-btn-white coach-fire-btn" onClick={() => setIsFireOpen(true)}>Fire Coach</button>
                <button type="button" className="panel-btn-white coach-report-btn" onClick={() => setIsReportOpen(true)}>Report</button>
            </div>

            {isReviewOpen && (
                <div className="coach-modal-overlay" onClick={() => setIsReviewOpen(false)}>
                    <div className="coach-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="coach-modal-header">
                            <div className="dashboard-heading coach-modal-title">
                                {myReview ? `Edit Review for ${coachName}` : `Review ${coachName}`}
                            </div>
                            <button type="button" className="coach-modal-close" onClick={() => setIsReviewOpen(false)}>X</button>
                        </div>
                        <form onSubmit={handleSubmitReview}>
                            <div className="review-stars-input">
                                <span className="stat-heading">Rating</span>
                                <div className="review-stars-row">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            key={star}
                                            className={`review-star ${star <= (reviewHover || reviewRating) ? 'filled' : ''}`}
                                            onClick={() => setReviewRating(star)}
                                            onMouseEnter={() => setReviewHover(star)}
                                            onMouseLeave={() => setReviewHover(0)}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <label className="daily-checkin-field">
                                <span className="stat-heading">Comment</span>
                                <textarea
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    placeholder="Share your experience with this coach..."
                                    rows="4"
                                />
                            </label>
                            {!reviewAllowed && !myReview && (
                                <p className="daily-checkin-error">You can only review a coach you have or had a contract with.</p>
                            )}
                            {reviewError && <p className="daily-checkin-error">{reviewError}</p>}
                            {reviewMessage && <p className="daily-checkin-success">{reviewMessage}</p>}
                            <div className="daily-checkin-actions">
                                <button type="button" className="panel-btn-white" onClick={() => setIsReviewOpen(false)}>Cancel</button>
                                {myReview && (
                                    <button type="button" className="panel-btn-white coach-report-btn" onClick={handleDeleteReview} disabled={reviewSubmitting}>
                                        {reviewSubmitting ? 'Deleting...' : 'Delete Review'}
                                    </button>
                                )}
                                <button type="submit" className="panel-btn-purple" disabled={reviewSubmitting || (!reviewAllowed && !myReview)}>
                                    {reviewSubmitting
                                        ? 'Submitting...'
                                        : myReview
                                            ? 'Update Review'
                                            : 'Submit Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isFireOpen && (
                <div className="coach-modal-overlay" onClick={() => setIsFireOpen(false)}>
                    <div className="coach-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="coach-modal-header">
                            <div className="dashboard-heading coach-modal-title">Fire Coach</div>
                            <button type="button" className="coach-modal-close" onClick={() => setIsFireOpen(false)}>X</button>
                        </div>
                        <p className="stat-descriptor fire-warning">
                            Are you sure you want to fire <strong>{coachName}</strong>? This will end your coaching contract and remove them as your coach. This action cannot be undone.
                        </p>
                        {fireError && <p className="daily-checkin-error">{fireError}</p>}
                        <div className="daily-checkin-actions">
                            <button type="button" className="panel-btn-white" onClick={() => setIsFireOpen(false)}>Cancel</button>
                            <button type="button" className="panel-btn-fire" onClick={handleFireCoach} disabled={fireSubmitting}>
                                {fireSubmitting ? 'Firing...' : 'Yes, Fire Coach'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isReportOpen && (
                <div className="coach-modal-overlay" onClick={() => setIsReportOpen(false)}>
                    <div className="coach-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="coach-modal-header">
                            <div className="dashboard-heading coach-modal-title">Report {coachName}</div>
                            <button type="button" className="coach-modal-close" onClick={() => setIsReportOpen(false)}>X</button>
                        </div>
                        <form onSubmit={handleSubmitReport}>
                            <label className="daily-checkin-field">
                                <span className="stat-heading">Reason</span>
                                <select value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                                    <option value="Inappropriate behavior">Inappropriate behavior</option>
                                    <option value="Not responsive">Not responsive</option>
                                    <option value="Poor quality coaching">Poor quality coaching</option>
                                    <option value="Misleading qualifications">Misleading qualifications</option>
                                    <option value="Harassment">Harassment</option>
                                    <option value="Other">Other</option>
                                </select>
                            </label>
                            <label className="daily-checkin-field">
                                <span className="stat-heading">Details (optional)</span>
                                <textarea
                                    value={reportDetails}
                                    onChange={(e) => setReportDetails(e.target.value)}
                                    placeholder="Provide any additional details..."
                                    rows="4"
                                />
                            </label>
                            {reportError && <p className="daily-checkin-error">{reportError}</p>}
                            {reportMessage && <p className="daily-checkin-success">{reportMessage}</p>}
                            <div className="daily-checkin-actions">
                                <button type="button" className="panel-btn-white" onClick={() => setIsReportOpen(false)}>Cancel</button>
                                <button type="submit" className="panel-btn-purple" disabled={reportSubmitting}>
                                    {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
