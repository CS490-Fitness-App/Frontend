import React, { useState, useEffect } from 'react'

import { ExerciseCard } from "../components/ExerciseCard"
import { ViewExercise } from "../components/ViewExercise"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export const Exercises = () => {
    const [exercises, setExercises] = useState([])
    const [selectedExercise, setSelectedExercise] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const openModal = (exercise) => {
        setSelectedExercise(exercise)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedExercise(null)
    }

    useEffect(() => {
        fetch(`${API_BASE_URL}/exercises`)
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
    }, []);

    /*const selectedExercise = exercises.find(
        ex => ex.exercise_id === selectedExerciseId
    );*/

    return (
        <div>
            <div className="page-heading">
                <div className="h1">
                    <span className="text-black">Exercise </span>
                    <span className="text-purple">Library</span>
                </div>
            </div>

            {/*temporary button for testing view exercise*/}
            <button onClick={() => openModal()}>view exercise</button>

            {loading && <p>Loading exercises...</p>}
            {error && <p>Error: {error}</p>}

            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
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
