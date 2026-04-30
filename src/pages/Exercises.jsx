import React, { useState, useEffect } from 'react'

import './Pages.css'
import './Exercises.css'
import { ExerciseCard } from "../components/ExerciseCard"
import { ViewExercise } from "../components/ViewExercise"
import { ExerciseFilters } from '../components/ExerciseFilters'
import { API_BASE_URL } from '../utils/apiBaseUrl'

export const Exercises = () => {
    const [exercises, setExercises] = useState([])
    const [selectedExercise, setSelectedExercise] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filters, setFilters] = useState({
        name: '',
        category_id: '',
        experience_level_id: '',
    })

    const buildQuery = (values) => {
        const params = new URLSearchParams()

        if (values.name) params.append('name', values.name)
        if (values.category_id) params.append('category_id', values.category_id)
        if (values.experience_level_id) params.append('experience_level_id', values.experience_level_id)

        return params.toString()
    }

    useEffect(() => {
        setLoading(true)
        const queryString = buildQuery(filters)
        const exercisesUrl = queryString ? `${API_BASE_URL}/exercises?${queryString}` : `${API_BASE_URL}/exercises`

        fetch(exercisesUrl)
            .then(res => {
                if (!res.ok) throw new Error(`Failed to load exercises (${res.status})`)
                return res.json()
            })
            .then(data => {
                setExercises(data)
                setLoading(false)
            })
            .catch(err => {
                setError(err.message)
                setLoading(false)
            })
    }, [filters])

    const openModal = (exercise) => {
        setSelectedExercise(exercise)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedExercise(null)
    }

    return (
        <div>
            <div className="page-heading">
                <div className="h1">
                    <span className="text-black">Exercise </span>
                    <span className="text-purple">Library</span>
                </div>
            </div>

            {loading && <p>Loading exercises...</p>}
            {error && <p className="feedback-msg error" style={{ padding: '1rem 2rem' }}>{error}</p>}

            <ExerciseFilters filters={filters} setFilters={setFilters} />

            <div style={{ display: 'flex', flexWrap: 'wrap', padding: '0 2rem' }}>
                {exercises.map(exercise => (
                    <ExerciseCard
                        key={exercise.exercise_id}
                        exercise={exercise}
                        onClick={() => openModal(exercise)}
                    />
                ))}
            </div>

            <ViewExercise isOpen={isModalOpen} onClose={closeModal} exercise={selectedExercise} />
        </div>
    )
}
