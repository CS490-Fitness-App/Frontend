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
    const [equipmentOptions, setEquipmentOptions] = useState([])
    const [muscleGroups, setMuscleGroups] = useState([])
    const [categories, setCategories] = useState([])
    const [experienceLevels, setExperienceLevels] = useState([])
    const [filters, setFilters] = useState({
        name: '',
        category_id: '',
        experience_level_id: '',
        equipment: '',
        muscle_group_id: '',
    })

    useEffect(() => {
        // Equipment / categories / experience levels come from the meta endpoint.
        // Muscle groups are derived from actual exercise records so only groups
        // used by at least one exercise appear as filter options.
        const extractMuscleGroups = (allExercises) => {
            const seen = new Set()
            const mgList = []
            for (const ex of allExercises) {
                const ids = ex.muscle_group_ids || []
                const names = ex.muscle_groups || []
                for (let i = 0; i < ids.length; i++) {
                    if (!seen.has(ids[i])) {
                        seen.add(ids[i])
                        mgList.push({ id: ids[i], name: names[i] })
                    }
                }
            }
            const sorted = [...mgList].sort((a, b) => a.name.localeCompare(b.name))
            return sorted
        }

        Promise.all([
            fetch(`${API_BASE_URL}/exercises/meta/options`).then(r => r.ok ? r.json() : null),
            fetch(`${API_BASE_URL}/exercises`).then(r => r.ok ? r.json() : []),
        ]).then(([meta, allExercises]) => {
            if (meta) {
                setEquipmentOptions(meta.equipment ?? [])
                setCategories(meta.categories ?? [])
                setExperienceLevels(meta.experience_levels ?? [])
            }
            setMuscleGroups(extractMuscleGroups(allExercises))
        }).catch(() => {})
    }, [])

    const buildQuery = (values) => {
        const params = new URLSearchParams()

        if (values.name) params.append('name', values.name)
        if (values.category_id) params.append('category_id', values.category_id)
        if (values.experience_level_id) params.append('experience_level_id', values.experience_level_id)
        if (values.equipment) params.append('equipment', values.equipment)
        if (values.muscle_group_id) params.append('muscle_group_id', values.muscle_group_id)

        return params.toString()
    }

    useEffect(() => {
        setLoading(true)
        const timer = setTimeout(() => {
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
        }, 300)
        return () => clearTimeout(timer)
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

            {loading && <p className="state-message loading">Loading exercises...</p>}
            {error && <p className="feedback-msg error" style={{ padding: '1rem 2rem' }}>{error}</p>}

            <ExerciseFilters
                filters={filters}
                setFilters={setFilters}
                equipmentOptions={equipmentOptions}
                muscleGroups={muscleGroups}
                categories={categories}
                experienceLevels={experienceLevels}
            />

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
