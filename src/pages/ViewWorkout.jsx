import "./Pages.css"
import "./ViewWorkout.css"
import "./Workout.css"
import "../components/CalendarPopup.css"
import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useCustomAuth } from '../context/AuthContext'
import { ViewExercise } from '../components/ViewExercise'
import { Sidebar } from "../components/Sidebar"
import { API_BASE_URL } from '../utils/apiBaseUrl'

import { FaRegStar } from "react-icons/fa6";
import { FaStar } from "react-icons/fa6";

export const ViewWorkout = () => {
    const { workoutId } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const { getAccessTokenSilently, isAuthenticated } = useAuth0()
    const { customAuth, userRole } = useCustomAuth()
    const [workout, setWorkout] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedExercise, setSelectedExercise] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [starToggled, setStarToggled] = useState(false)

    // Coach: schedule-for-client picker
    const [showClientPicker, setShowClientPicker] = useState(false)
    const [clients, setClients] = useState([])
    const [loadingClients, setLoadingClients] = useState(false)

    const isPublicSource = new URLSearchParams(location.search).get('source') === 'public'

    const getToken = async () => {
        if (isAuthenticated) {
            return getAccessTokenSilently({ authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE } })
        }
        if (customAuth) return customAuth
        throw new Error('Not authenticated')
    }

    useEffect(() => {
        const fetchWorkout = async () => {
            try {
                if (isPublicSource) {
                    const publicResponse = await fetch(`${API_BASE_URL}/workouts/public/${workoutId}`)
                    if (!publicResponse.ok) {
                        throw new Error(`Failed to load workout (${publicResponse.status})`)
                    }
                    const publicData = await publicResponse.json()
                    setWorkout(publicData)
                    return
                }

                let token

                if (isAuthenticated) {
                    token = await getAccessTokenSilently({
                        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
                    })
                } else if (customAuth) {
                    token = customAuth
                } else {
                    setError('Log in to view this workout.')
                    setLoading(false)
                    return
                }

                const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })

                if (!response.ok) {
                    throw new Error(`Failed to load workout (${response.status})`)
                }

                const data = await response.json()
                setWorkout(data)
            } catch (err) {
                setError(err.message || 'Unable to load workout.')
            } finally {
                setLoading(false)
            }
        }

        fetchWorkout()
    }, [customAuth, getAccessTokenSilently, isAuthenticated, workoutId, isPublicSource])

    const handleExerciseClick = async (exerciseId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/exercises/${exerciseId}`)
            if (!response.ok) {
                throw new Error(`Failed to load exercise (${response.status})`)
            }

            const data = await response.json()
            setSelectedExercise(data)
            setIsModalOpen(true)
        } catch (err) {
            console.error('Failed to load exercise details:', err)
        }
    }

    const handleScheduleForMe = () => {
        navigate(`/calendar?workout_id=${workoutId}`)
    }

    const handleOpenClientPicker = async () => {
        setShowClientPicker(true)
        if (clients.length > 0) return
        setLoadingClients(true)
        try {
            const token = await getToken()
            const meRes = await fetch(`${API_BASE_URL}/coaches/me`, { headers: { Authorization: `Bearer ${token}` } })
            const me = await meRes.json()
            const clientsRes = await fetch(`${API_BASE_URL}/coaches/${me.coach_id}/clients`, { headers: { Authorization: `Bearer ${token}` } })
            const data = await clientsRes.json()
            setClients(data.active_clients || [])
        } catch (e) {
            console.error('Failed to load clients', e)
        } finally {
            setLoadingClients(false)
        }
    }

    const handleSelectClient = (client) => {
        const name = encodeURIComponent(`${client.first_name} ${client.last_name}`.trim())
        navigate(`/calendar?workout_id=${workoutId}&client_id=${client.user_id}&client_name=${name}`)
    }

    return (
        <div>
            <div className="workouts-container">
                <Sidebar />

                <div className="workouts-content">
                    <div className="page-heading">
                        <div className="h2">
                            <button onClick={() => setStarToggled(!starToggled)} className="workout-star">
                                { starToggled ? <FaStar /> : <FaRegStar /> }
                            </button>
                            <span> </span>
                            {loading ? 'Loading workout...' : workout?.name || 'Workout Plan'}
                        </div>
                        <Link to={`/edit-workout/${workoutId}`} className="edit-workout-plan-btn">
                            <div className="btn">Edit Workout</div>
                        </Link>
                    </div>

                    <div className="stats-row">
                        <div className="stat-card">
                            <h5 className="workout-h5">Experience Level</h5>
                            <div className="stat-border">
                                <div className="statistic">{workout?.experience_level || 'N/A'}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <h5 className="workout-h5">Exercise Type</h5>
                            <div className="stat-border">
                                <div className="statistic">{workout?.goal_type || 'N/A'}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <h5 className="workout-h5">Equipment Required</h5>
                            <div className="stat-border">
                                <div className="statistic">{workout?.equipment_required || 'None'}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <h5 className="workout-h5">Workout Time</h5>
                            <div className="stat-border">
                                <div className="statistic">{workout?.workout_time_mins || 'None'} minutes</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <h5 className="workout-h5">Intended Duration</h5>
                            <div className="stat-border">
                                <div className="statistic">{workout?.intended_duration_weeks || 'None'} weeks</div>
                            </div>
                        </div>
                    </div>

                    {error && <p className="feedback-msg error" style={{ padding: '0.5rem 2rem' }}>{error}</p>}

                    <table className="workout-table">
                        <thead>
                            <tr>
                                <th>Exercise</th>
                                <th>Sets</th>
                                <th>Target</th>
                                <th>Rest</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && workout?.exercises?.length === 0 && (
                                <tr>
                                    <td colSpan="4"><span className="state-message">No exercises in this workout yet.</span></td>
                                </tr>
                            )}
                            {workout?.exercises?.map((exercise) => (
                                <tr
                                    key={`${exercise.exercise_id}-${exercise.order_in_workout}`}
                                    className="workout-exercise-row"
                                    onClick={() => handleExerciseClick(exercise.exercise_id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td className="exercise-row-first">{exercise.exercise_name}</td>
                                    <td>{exercise.sets ?? 'N/A'}</td>
                                    <td>{exercise.target_value ?? 'N/A'} {exercise.unit_name}</td>
                                    <td className="exercise-row-last">{exercise.rest ?? 'N/A'} sec</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="workout-action-row">
                        {userRole === 'coach' ? (
                            <>
                                <button className="vw-schedule-btn btn-periwinkle" onClick={handleScheduleForMe}>Schedule for Me</button>
                                <button className="vw-schedule-btn btn-outline" onClick={handleOpenClientPicker}>Schedule for Client</button>
                            </>
                        ) : (
                            <button className="vw-schedule-btn btn-periwinkle" onClick={handleScheduleForMe}>Schedule Workout</button>
                        )}
                    </div>

                    {showClientPicker && (
                        <div className="vw-client-picker">
                            <p className="vw-client-picker-label">Select a client</p>
                            {loadingClients && <p className="state-message loading">Loading clients...</p>}
                            {!loadingClients && clients.length === 0 && (
                                <p className="state-message">No active clients found.</p>
                            )}
                            {!loadingClients && clients.length > 0 && (
                                <select
                                    className="calendar-form-input"
                                    defaultValue=""
                                    onChange={(e) => {
                                        const client = clients.find((c) => String(c.user_id) === e.target.value)
                                        if (client) handleSelectClient(client)
                                    }}
                                >
                                    <option value="" disabled>— pick a client —</option>
                                    {clients.map((c) => (
                                        <option key={c.user_id} value={c.user_id}>
                                            {c.first_name} {c.last_name}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <div className="vw-client-picker-actions">
                                <button className="vw-schedule-btn btn-outline" onClick={() => setShowClientPicker(false)}>Cancel</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ViewExercise
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setSelectedExercise(null)
                }}
                exercise={selectedExercise}
            />
        </div>
    )
}
