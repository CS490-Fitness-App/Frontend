import React, { useState, useEffect } from 'react'

import { ExerciseCard } from "../components/ExerciseCard"
import { ViewExercise } from "../components/ViewExercise"
import { ExerciseFilters } from "../components/ExerciseFilters"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export const Exercises = () => {
    const [exercises, setExercises] = useState([])
    const [selectedExercise, setSelectedExercise] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [query, setQuery] = useState('');

    const [filters, setFilters] = useState({
        name: "",
        category_id: "",
        experience_level_id: ""
    });

    const buildQuery = (filters) => {
        const params = new URLSearchParams()

        if (filters.name) params.append("name", filters.name)
        if (filters.category_id) params.append("category_id", filters.category_id)
        if (filters.experience_level_id) params.append("experience_level_id", filters.experience_level_id)

        return params.toString();
    };

    useEffect(() => {
        setLoading(true)
        const queryString = buildQuery(filters);

        fetch(`${API_BASE_URL}/exercises?${queryString}`)
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
            {error && <p>Error: {error}</p>}
            <div style={{display:'flex', justifyContent:'center', flexDirection:'column'}}>

            

                <ExerciseFilters filters={filters} setFilters={setFilters} />
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent:'center' }}>
                    {exercises.map(exercise => (
                        <ExerciseCard
                            key={exercise.exercise_id}
                            exercise={exercise}
                            onClick={() => openModal(exercise)}
                        />
                    ))}
                </div>
            </div>

            <ViewExercise isOpen={isModalOpen} onClose={closeModal} exercise={selectedExercise} />
        </div>
    )
}
