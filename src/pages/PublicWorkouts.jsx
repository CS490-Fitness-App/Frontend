import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useCustomAuth } from '../context/AuthContext'

import { WorkoutCard } from '../components/WorkoutCard'
import { WorkoutFilters } from '../components/WorkoutFilters'
import { LoginForm } from "../components/LoginForm"
import './Pages.css'
import './Workout.css'
import { API_BASE_URL } from '../utils/apiBaseUrl'

export const PublicWorkouts = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth0()
    const { customAuth } = useCustomAuth()

    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

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
        setLoading(true)
        const timer = setTimeout(() => {
            const queryString = buildQuery(filters)
            const workoutsUrl = queryString ? `${API_BASE_URL}/workouts/public?${queryString}` : `${API_BASE_URL}/workouts/public`

            fetch(workoutsUrl)
                .then(res => {
                    if (!res.ok) throw new Error(`Failed to load workouts (${res.status})`)
                    return res.json()
                })
                .then(data => {
                    setWorkouts(data)
                    setLoading(false)
                })
                .catch(err => {
                    setError(err.message)
                    setLoading(false)
                })
        }, 300)
        return () => clearTimeout(timer)
    }, [filters])

    const handleWorkoutClick = (workoutId) => {
        if (isAuthenticated || customAuth) {
            navigate(`/view-workout/${workoutId}?source=public`)
            return
        }
        openModal()
    }

    return (
        <div>
            <div className="page-heading">
                <div className="h1">
                    <span className="text-black">Workout </span>
                    <span className="text-purple">Plans</span>
                </div>
            </div>

            {loading && <p className="state-message loading" style={{ padding: '0 2rem' }}>Loading workouts...</p>}
            {error && <p style={{ padding: '1rem 2rem' }}>Error: {error}</p>}

            <WorkoutFilters filters={filters} setFilters={setFilters} />

            <div className="workouts-grid">
                {workouts.map((workout) => (
                    <WorkoutCard
                        key={workout.workout_id}
                        workout={workout}
                        onClick={() => handleWorkoutClick(workout.workout_id)}
                    />
                ))}
            </div>

            <LoginForm isOpen={isModalOpen} onClose={closeModal} />
        </div>
    )
}
