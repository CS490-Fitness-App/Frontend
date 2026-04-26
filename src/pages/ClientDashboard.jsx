import React, { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaRegUser, FaChartPie } from "react-icons/fa"
import { BsBarChartFill } from "react-icons/bs"
import { FaClipboardCheck } from "react-icons/fa6"

import { useCustomAuth } from '../context/AuthContext'
import { Sidebar } from "../components/Sidebar"
import './Pages.css'
import './ClientDashboard.css'
import { API_BASE_URL } from '../utils/apiBaseUrl'

const getLocalDateString = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const getMsUntilNextMidnight = () => {
    const now = new Date()
    const nextMidnight = new Date(now)
    nextMidnight.setHours(24, 0, 0, 0)
    return Math.max(0, nextMidnight.getTime() - now.getTime())
}

const formatCountdown = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
    const seconds = String(totalSeconds % 60).padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
}

const readErrorDetail = async (response, fallbackMessage) => {
    const rawBody = await response.text().catch(() => '')
    if (!rawBody) {
        return fallbackMessage
    }

    try {
        const parsedBody = JSON.parse(rawBody)
        return parsedBody.detail || parsedBody.message || fallbackMessage
    } catch {
        return rawBody
    }
}

export const ClientDashboard = () => {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0()
    const { customAuth } = useCustomAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [isCheckInOpen, setIsCheckInOpen] = useState(false)
    const [checkInForm, setCheckInForm] = useState({
        caloriesIntake: '',
        steps: '',
        waterIntake: '',
        weightLb: '',
        moodLabel: 'Okay',
    })
    const [checkInSubmitting, setCheckInSubmitting] = useState(false)
    const [checkInMessage, setCheckInMessage] = useState('')
    const [checkInError, setCheckInError] = useState('')
    const [checkInLocked, setCheckInLocked] = useState(false)
    const [checkInCountdown, setCheckInCountdown] = useState('00:00:00')

    const displayFirstName = data?.full_name?.split(' ')[0] || data?.name?.split(' ')[0] || ''

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                let token
                if (isAuthenticated) {
                    token = await getAccessTokenSilently({
                        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
                    })
                } else if (customAuth) {
                    token = customAuth
                } else {
                    setLoading(false)
                    return
                }

                const dashboardRes = await fetch(`${API_BASE_URL}/dashboard/client`, {
                    headers: { Authorization: `Bearer ${token}` },
                })


                if (!dashboardRes.ok) {
                    throw new Error("Unable to load dashboard data.")
                }

                const dashboardData = await dashboardRes.json()
                setData(dashboardData)
                setError("")
            } catch (err) {
                console.error('Failed to load dashboard:', err)
                setError("Unable to load dashboard data.")
            } finally {
                setLoading(false)
            }
        }

        fetchDashboard()
    }, [isAuthenticated, customAuth, getAccessTokenSilently])

    useEffect(() => {
        const syncCheckInStatus = async () => {
            if (!isAuthenticated && !customAuth) {
                setCheckInLocked(false)
                setCheckInCountdown('00:00:00')
                return
            }

            try {
                const token = await getAuthToken()
                const today = getLocalDateString()
                const tzOffsetMinutes = new Date().getTimezoneOffset()
                const response = await fetch(`${API_BASE_URL}/logs/daily-checkin/status?for_date=${today}&tz_offset_minutes=${tzOffsetMinutes}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })

                if (!response.ok) {
                    return
                }

                const statusData = await response.json()
                setCheckInLocked(!!statusData.completed)

                const updateCountdown = () => {
                    const nextResetAt = new Date(statusData.next_reset_at).getTime()
                    const remaining = Math.max(0, nextResetAt - Date.now())
                    setCheckInCountdown(formatCountdown(remaining))
                }

                updateCountdown()
                const countdownId = window.setInterval(updateCountdown, 1000)
                return () => window.clearInterval(countdownId)
            } catch (syncError) {
                console.error('Failed to sync daily check-in status:', syncError)
            }
        }

        let cleanup = null
        syncCheckInStatus().then((cleanupFn) => {
            cleanup = cleanupFn || null
        })

        return () => {
            if (cleanup) cleanup()
        }
    }, [isAuthenticated, customAuth, getAccessTokenSilently])

    useEffect(() => {
        if (!location.state?.openDailyCheckIn || checkInLocked) {
            return
        }

        setCheckInError('')
        setCheckInMessage('')
        setIsCheckInOpen(true)
        navigate(location.pathname, { replace: true, state: {} })
    }, [location, navigate, checkInLocked])

    const formatWeight = (weight) => {
        if (weight === null || weight === undefined) return "Not set"
        return `${weight} LB`
    }

    const openCheckIn = () => {
        if (checkInLocked) {
            return
        }
        setCheckInError('')
        setCheckInMessage('')
        setIsCheckInOpen(true)
    }

    const closeCheckIn = () => {
        if (checkInSubmitting) return
        setIsCheckInOpen(false)
    }

    const updateCheckInField = (field) => (event) => {
        setCheckInForm((prev) => ({ ...prev, [field]: event.target.value }))
    }

    const parseOptionalNumber = (value) => {
        if (value === '' || value === null || value === undefined) return null
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : null
    }

    const getAuthToken = async () => {
        if (isAuthenticated) {
            return getAccessTokenSilently({
                authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
            })
        }
        if (customAuth) {
            return customAuth
        }
        throw new Error('You must be logged in to submit a daily check-in.')
    }

    const submitDailyCheckIn = async (event) => {
        event.preventDefault()
        setCheckInSubmitting(true)
        setCheckInError('')
        setCheckInMessage('')

        try {
            const token = await getAuthToken()
            const today = getLocalDateString()
            const payload = {
                date: today,
                calories_intake: parseOptionalNumber(checkInForm.caloriesIntake),
                step_count: parseOptionalNumber(checkInForm.steps),
                water_intake: parseOptionalNumber(checkInForm.waterIntake),
                weight_lb: parseOptionalNumber(checkInForm.weightLb),
                mood_label: checkInForm.moodLabel,
            }

            const response = await fetch(`${API_BASE_URL}/logs/daily-checkin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const detail = await readErrorDetail(response, 'Unable to save your daily check-in.')
                throw new Error(detail)
            }

            const dashboardRes = await fetch(`${API_BASE_URL}/dashboard/client`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (dashboardRes.ok) {
                const dashboardData = await dashboardRes.json()
                setData(dashboardData)
            }

            setCheckInLocked(true)
            setCheckInCountdown(formatCountdown(getMsUntilNextMidnight()))
            setCheckInMessage('Daily check-in saved for today.')
            setTimeout(() => {
                setIsCheckInOpen(false)
            }, 600)
        } catch (submitError) {
            console.error('Daily check-in failed:', submitError)
            const message = submitError.message || 'Unable to save your daily check-in.'
            if (message.toLowerCase().includes('already submitted')) {
                setCheckInLocked(true)
                setCheckInCountdown(formatCountdown(getMsUntilNextMidnight()))
                setIsCheckInOpen(false)
            }
            setCheckInError(message)
        } finally {
            setCheckInSubmitting(false)
        }
    }

    const progressText = data?.intended_duration_weeks
        ? `${data?.weeks_completed || 0} of ${data.intended_duration_weeks}`
        : `${data?.weeks_completed || 0} completed`

    return (
        <div>
            <div className="dashboard-container">
                <Sidebar />
                <div>
                    <div className="page-heading">
                        <div className="h2">
                            <span className="text-black">Welcome back, </span>
                            <span className="text-purple">
                                {loading ? "Loading..." : displayFirstName}
                            </span>
                        </div>
                      </div>


                    <div className="dashboard-homepage-container">
                        {error && <p className="stat-descriptor">{error}</p>}

                        <div className="section-quick-stats">
                            <div className="quick-stat-card">
                                <p className="stat-heading">TODAY'S WORKOUT</p>
                                <p className="stat">
                                    {loading ? "Loading..." : data?.today_workout || "No workout available."}
                                </p>
                                <p className="stat-descriptor">
                                    {loading ? "Loading..." : data?.today_descriptor || "Nothing scheduled for today"}
                                </p>
                            </div>
                            <div className="quick-stat-card">
                                <p className="stat-heading">WEEKLY STREAK</p>
                                <p className="stat">
                                    {loading ? "Loading..." : `${data?.weekly_streak ?? 0} / 7`}
                                </p>
                                <p className="stat-descriptor">
                                    {loading ? "Loading..." : data?.streak_descriptor || "No recent activity."}
                                </p>
                            </div>
                            <div className="quick-stat-card">
                                <p className="stat-heading">CURRENT WEIGHT</p>
                                <p className="stat">{loading ? "Loading..." : formatWeight(data?.current_weight_lb)}</p>
                                <p className="stat-descriptor">
                                    {loading ? "Loading..." : data?.weight_descriptor || "No goal weight set"}
                                </p>
                            </div>
                        </div>

                        <div className="section-2">
                            <div className="workout-plan-panel">
                                <div className="dashboard-heading">MY WORKOUT PLAN</div>
                                <div className="dashboard-list-container">
                                    <div className="dashboard-list-contents">
                                        <div className="stat-heading">CURRENT PLAN</div>
                                        <div className="dashboard-list">
                                            {loading ? "Loading..." : data?.current_plan_name || "No active workout plan"}
                                        </div>
                                    </div>
                                    <div className="dashboard-list-contents">
                                        <div className="stat-heading">NEXT WORKOUT</div>
                                        <div className="dashboard-list">
                                            {loading ? "Loading..." : data?.next_workout_name || "No upcoming workout"}
                                        </div>
                                    </div>
                                    <div className="dashboard-list-contents">
                                        <div className="stat-heading">SCHEDULE</div>
                                        <div className="dashboard-list">
                                            {loading ? "Loading..." : data?.next_workout_date || "No workout scheduled"}
                                        </div>
                                    </div>
                                    <div className="dashboard-list-contents">
                                        <div className="stat-heading">WEEKS COMPLETED</div>
                                        <div className="dashboard-list">
                                            {loading ? "Loading..." : progressText}
                                        </div>
                                    </div>
                                </div>
                                <div className="btn-container">
                                    <Link to="/workouts" className="panel-btn-purple">View Plan</Link>
                                </div>
                            </div>
                            <div className="coach-panel">
                                <div className="dashboard-heading">MY COACH</div>
                                <div className="coach-container">
                                    <div className="profile-bg">
                                        <FaRegUser />
                                    </div>
                                    <div className="container-59">
                                        <div className="dashboard-list">
                                            {loading ? "Loading..." : data?.coach_name || "No coach assigned"}
                                        </div>
                                        <div className="stat-heading">WORKOUT COACH</div>
                                    </div>
                                </div>
                                <div className="dashboard-list-container">
                                    <div className="dashboard-list-contents">
                                        <div className="stat-heading">STATUS</div>
                                        <div className="dashboard-list">
                                            {loading ? "Loading..." : data?.coach_status || "No active coach"}
                                        </div>
                                    </div>
                                    <div className="dashboard-list-contents">
                                        <div className="stat-heading">RECENT ACTIVITY</div>
                                        <div className="dashboard-list">
                                            {loading ? "Loading..." : data?.recent_activity || "No recent activity."}
                                        </div>
                                    </div>
                                </div>
                                <div className="btn-container">
                                    <Link className="panel-btn-purple">Message</Link>
                                    <Link className="panel-btn-white">View Profile</Link>
                                </div>
                            </div>
                        </div>

                        <div className="section-2">
                            <div className="workout-plan-panel">
                                <div className="container-others">
                                    <div className="icon-bg">
                                        <BsBarChartFill />
                                    </div>
                                    <div className="header-others">LOG ACTIVITY</div>
                                    <div className="stat-descriptor">Record your sets, reps, weights, and cardio for today&apos;s workout.</div>
                                </div>
                                <div className="btn-container">
                                    <Link className="panel-btn-purple">Log Now</Link>
                                </div>
                            </div>
                            <div className="workout-plan-panel">
                                <div className="container-others">
                                    <div className="icon-bg">
                                        <FaClipboardCheck />
                                    </div>
                                    <div className="header-others">DAILY CHECK-IN</div>
                                    <div className="stat-descriptor">Log your calories, steps, water intake, weight, and mood for today.</div>
                                </div>
                                <div className="btn-container">
                                    <button type="button" className="panel-btn-purple" onClick={openCheckIn} disabled={checkInLocked}>
                                        {checkInLocked ? `Available in ${checkInCountdown}` : 'Check In'}
                                    </button>
                                </div>
                            </div>
                            <div className="workout-plan-panel">
                                <div className="container-others">
                                    <div className="icon-bg">
                                        <FaChartPie />
                                    </div>
                                    <div className="header-others">VIEW PROGRESS</div>
                                    <div className="stat-descriptor">See your charts and trends over the past weeks and months.</div>
                                </div>
                                <div className="btn-container">
                                    <Link to="/view-progress" className="panel-btn-purple">View Charts</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isCheckInOpen && (
                <div className="daily-checkin-overlay" onClick={closeCheckIn}>
                    <div className="daily-checkin-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="daily-checkin-header">
                            <div className="dashboard-heading daily-checkin-title">Daily Check-In</div>
                            <button type="button" className="daily-checkin-close" onClick={closeCheckIn}>X</button>
                        </div>

                        <p className="stat-descriptor daily-checkin-description">
                            Log your calories, steps, water intake, weight, and mood for today.
                        </p>

                        <form className="daily-checkin-form" onSubmit={submitDailyCheckIn}>
                            <label className="daily-checkin-field">
                                <span className="stat-heading">Calories</span>
                                <input type="number" min="0" value={checkInForm.caloriesIntake} onChange={updateCheckInField('caloriesIntake')} placeholder="e.g. 2100" />
                            </label>

                            <label className="daily-checkin-field">
                                <span className="stat-heading">Steps</span>
                                <input type="number" min="0" value={checkInForm.steps} onChange={updateCheckInField('steps')} placeholder="e.g. 9000" />
                            </label>

                            <label className="daily-checkin-field">
                                <span className="stat-heading">Water Intake (glasses)</span>
                                <input type="number" min="0" value={checkInForm.waterIntake} onChange={updateCheckInField('waterIntake')} placeholder="e.g. 8" />
                            </label>

                            <label className="daily-checkin-field">
                                <span className="stat-heading">Weight (LB)</span>
                                <input type="number" min="0" step="0.1" value={checkInForm.weightLb} onChange={updateCheckInField('weightLb')} placeholder="e.g. 178.4" />
                            </label>

                            <label className="daily-checkin-field">
                                <span className="stat-heading">Mood</span>
                                <select value={checkInForm.moodLabel} onChange={updateCheckInField('moodLabel')}>
                                    <option value="Amazing">Amazing</option>
                                    <option value="Good">Good</option>
                                    <option value="Okay">Okay</option>
                                    <option value="Bad">Bad</option>
                                    <option value="Awful">Awful</option>
                                </select>
                            </label>

                            {checkInError && <p className="daily-checkin-error">{checkInError}</p>}
                            {checkInMessage && <p className="daily-checkin-success">{checkInMessage}</p>}

                            <div className="daily-checkin-actions">
                                <button type="button" className="panel-btn-white" onClick={closeCheckIn}>Cancel</button>
                                <button type="submit" className="panel-btn-purple" disabled={checkInSubmitting}>
                                    {checkInSubmitting ? 'Saving...' : 'Save Check-In'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
