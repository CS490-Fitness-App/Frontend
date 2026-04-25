import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useCustomAuth } from '../context/AuthContext'
import { WorkoutCard } from '../components/WorkoutCard'
import { WorkoutFilters } from '../components/WorkoutFilters'
import './Pages.css'
import './Workout.css'
import { API_BASE_URL } from '../utils/apiBaseUrl'

export const Workouts = () => {
    const navigate = useNavigate()
    const { getAccessTokenSilently, isAuthenticated, user } = useAuth0()
    const { customAuth } = useCustomAuth()
    const [workouts, setWorkouts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filters, setFilters] = useState({
        name: '',
        goal_type_id: '',
        experience_level_id: '',
    })

    const buildQuery = (values) => {
        const params = new URLSearchParams()

        if (values.name) params.append('name', values.name)
        if (values.goal_type_id) params.append('goal_type_id', values.goal_type_id)
        if (values.experience_level_id) params.append('experience_level_id', values.experience_level_id)

        return params.toString()
    }

    useEffect(() => {
        const syncBackendUser = async (token) => {
            if (!isAuthenticated || !user) {
                return false
            }

            const syncResponse = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email: user.email || null,
                    first_name: user.given_name || user.name || null,
                    last_name: user.family_name || null,
                    profile_picture: user.picture || null,
                    role: 'client',
                }),
            })

            return syncResponse.ok
        }

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

                const queryString = buildQuery(filters)
                const workoutsUrl = queryString ? `${API_BASE_URL}/workouts?${queryString}` : `${API_BASE_URL}/workouts`

                const response = await fetch(workoutsUrl, {
                    headers: { Authorization: `Bearer ${token}` },
                })

                if (response.status === 401 && await syncBackendUser(token)) {
                    const retryResponse = await fetch(workoutsUrl, {
                        headers: { Authorization: `Bearer ${token}` },
                    })

                    if (!retryResponse.ok) {
                        throw new Error(`Failed to load workouts (${retryResponse.status})`)
                    }

                    const retryData = await retryResponse.json()
                    setWorkouts(retryData)
                    return
                }

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
    }, [customAuth, filters, getAccessTokenSilently, isAuthenticated, user])

    return (
        <div>
            <div className="page-heading">
                <div className="h1">
                    <span className="text-black">Workout </span>
                    <span className="text-purple">Plans</span>
                </div>
            </div>

            {loading && <p style={{ padding: '1rem 2rem' }}>Loading workouts...</p>}
            {error && <p className="feedback-msg error" style={{ padding: '1rem 2rem' }}>{error}</p>}

            <WorkoutFilters filters={filters} setFilters={setFilters} />

            <div className="workouts-grid">
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
