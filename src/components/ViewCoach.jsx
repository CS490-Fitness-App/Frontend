import "./ViewCoach.css"
import React, { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useCustomAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../utils/apiBaseUrl'

import { MdCancel } from "react-icons/md";
import { MdFitnessCenter } from "react-icons/md";

export const ViewCoach = ({ isOpen, onClose, coach }) => {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0()
    const { customAuth } = useCustomAuth()
    const [requestStatus, setRequestStatus] = useState(null)
    const [requestError, setRequestError] = useState('')

    useEffect(() => {
        setRequestStatus(null)
        setRequestError('')
    }, [coach?.coach_id])

    if (!coach) return null

    const handleRequestCoach = async () => {
        setRequestStatus('sending')
        setRequestError('')
        try {
            let token
            if (isAuthenticated) {
                token = await getAccessTokenSilently({
                    authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
                })
            } else if (customAuth) {
                token = customAuth
            } else {
                throw new Error('You must be logged in to request a coach.')
            }

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

                    {/* Stats Row */}
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
                        <div style={{ marginTop: '1rem' }}>
                            {requestStatus === 'success' ? (
                                <p style={{ color: 'green' }}>Request sent successfully!</p>
                            ) : (
                                <>
                                    {requestStatus === 'error' && (
                                        <p style={{ color: 'red', marginBottom: '0.5rem' }}>{requestError}</p>
                                    )}
                                    <button
                                        className="btn-periwinkle"
                                        onClick={handleRequestCoach}
                                        disabled={requestStatus === 'sending'}
                                    >
                                        {requestStatus === 'sending' ? 'SENDING...' : 'REQUEST COACH'}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
