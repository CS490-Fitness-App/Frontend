import "./Pages.css"
import "./ViewWorkout.css"
import React, { useEffect, useState } from 'react'
<<<<<<< Updated upstream
import { Link, useParams } from 'react-router-dom'
=======
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
>>>>>>> Stashed changes
import { useAuth0 } from '@auth0/auth0-react'
import { useCustomAuth } from '../context/AuthContext'
import { ViewExercise } from '../components/ViewExercise'
import { API_BASE_URL } from '../utils/apiBaseUrl'

import { FaRegStar } from "react-icons/fa6";
import { FaStar } from "react-icons/fa6";

export const ViewWorkout = () => {
    const { workoutId } = useParams()
<<<<<<< Updated upstream
=======
    const location = useLocation()
    const navigate = useNavigate()
>>>>>>> Stashed changes
    const { getAccessTokenSilently, isAuthenticated } = useAuth0()
    const { customAuth } = useCustomAuth()
    const [workout, setWorkout] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedExercise, setSelectedExercise] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [starToggled, setStarToggled] = useState(false)

<<<<<<< Updated upstream
=======
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

>>>>>>> Stashed changes
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

    return (
        <div>
            <div className="page-heading">
                <h1 className="h1">{loading ? 'Loading workout...' : workout?.name || 'Workout Plan'}</h1>
                <button onClick={() => setStarToggled(!starToggled)} className="workout-star">
                    { starToggled ? <FaStar /> : <FaRegStar /> }
                </button>
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

            {error && <p style={{ padding: '0 2rem', color: '#b91c1c' }}>{error}</p>}

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
                            <td colSpan="4">No exercises in this workout yet.</td>
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

            <Link to={`/edit-workout/${workoutId}`} className="edit-workout-plan-btn">
                <div className="btn">Edit Workout</div>
            </Link>

            <ViewExercise
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setSelectedExercise(null)
                }}
                exercises={selectedExercise}
            />
        </div>
    )
}
