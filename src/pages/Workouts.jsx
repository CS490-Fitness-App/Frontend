import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useCustomAuth } from '../context/AuthContext'
import { WorkoutCard } from '../components/WorkoutCard'
import './Pages.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export const Workouts = () => {
    const navigate = useNavigate()
    const { getAccessTokenSilently, isAuthenticated } = useAuth0()
    const { customAuth } = useCustomAuth()
    const [workouts, setWorkouts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchWorkouts = async () => {
            try {
                let token

                if (isAuthenticated) {
                    token = await getAccessTokenSilently({
                        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
                    })
                } else if (customAuth) {
                    token = customAuth
                } else {
                    setError('Log in to view workout plans.')
                    setLoading(false)
                    return
                }

                const response = await fetch(`${API_BASE_URL}/workouts`, {
                    headers: { Authorization: `Bearer ${token}` },
                })

                if (!response.ok) {
                    throw new Error(`Failed to load workouts (${response.status})`)
                }

                const data = await response.json()
                setWorkouts(data)
            } catch (err) {
                setError(err.message || 'Unable to load workouts.')
            } finally {
                setLoading(false)
            }
        }

        fetchWorkouts()
    }, [customAuth, getAccessTokenSilently, isAuthenticated])

    return (
        <div>
            <div className="page-heading">
                <div className="h1">
                    <span className="text-black">Workout </span>
                    <span className="text-purple">Plans</span>
                </div>
            </div>

            {loading && <p style={{ padding: '1rem 2rem' }}>Loading workouts...</p>}
            {error && <p style={{ padding: '1rem 2rem' }}>Error: {error}</p>}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', padding: '1rem 2rem 2rem' }}>
                {workouts.map((workout) => (
                    <WorkoutCard
                        key={workout.workout_id}
                        workout={workout}
                        onClick={() => navigate(`/view-workout/${workout.workout_id}`)}
                    />
                ))}
            </div>
        </div>
    )
}
