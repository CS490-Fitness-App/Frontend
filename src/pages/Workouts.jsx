import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useCustomAuth } from '../context/AuthContext'
import { WorkoutCard } from '../components/WorkoutCard'
import { IoMdSearch } from "react-icons/io";
import { WorkoutFilters } from "../components/WorkoutFilters"

import './Pages.css'
import './Workout.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export const Workouts = () => {
    const navigate = useNavigate()
    const { getAccessTokenSilently, isAuthenticated } = useAuth0()
    const { customAuth } = useCustomAuth()
    const [workouts, setWorkouts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [workoutSearch, setWorkoutSearch] = useState('');
    const [filters, setFilters] = useState({
        name: "",
        goal_type_id: 0,
        experience_level_id: 0
    });

    const buildQuery = (filters) => {
        const params = new URLSearchParams()

        if (filters.name) params.append("name", filters.name)
        if (filters.goal_type_id) params.append("goal_type_id", filters.goal_type_id)
        if (filters.experience_level_id) params.append("experience_level_id", filters.experience_level_id)

        return params.toString();
    };

    useEffect(() => {
        const fetchWorkouts = async () => {
            //setLoading(true)
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
                
                const queryString = buildQuery(filters);

                const response = await fetch(`${API_BASE_URL}/workouts?${queryString}`, {
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
    }, [filters, customAuth, getAccessTokenSilently, isAuthenticated])

    return (
        <div>
            <div className="page-heading">
                <div className="h1">
                    <span className="text-black">Workout </span>
                    <span className="text-purple">Plans</span>
                </div>
            </div>

            {/* Searchbar */}
            <div className="search-section">
                <div className="search-box">
                    <input className="search-input" type="text" placeholder="Search workout plans..." value={workoutSearch} onChange={(e) => setWorkoutSearch(e.target.value)} />
                    <IoMdSearch />
                </div>
            </div>

            {loading && <p style={{ padding: '1rem 2rem' }}>Loading workouts...</p>}
            {error && <p style={{ padding: '1rem 2rem' }}>Error: {error}</p>}
            <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>

                <WorkoutFilters filters={filters} setFilters={setFilters} />
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
        </div>
    )
}
