import "./Pages.css"
import "./ViewWorkout.css"
import "./Workout.css"
import React, { useEffect, useState } from 'react'
import { Sidebar } from "../components/Sidebar"
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useCustomAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../utils/apiBaseUrl'

import { MdDragHandle } from "react-icons/md";

const EXPERIENCE_OPTIONS = [
    { id: 1, label: 'Beginner' },
    { id: 2, label: 'Intermediate' },
    { id: 3, label: 'Advanced' },
]
const GOAL_OPTIONS = [
    { id: 1, label: 'Lose Weight' },
    { id: 2, label: 'Build Muscle' },
    { id: 3, label: 'Improve Endurance' },
    { id: 4, label: 'Stay Healthy' },
    { id: 5, label: 'Other' },
]
const UNIT_OPTIONS = [
    { id: 1, label: 'reps' },
    { id: 2, label: 'hrs' },
    { id: 3, label: 'mins' },
    { id: 4, label: 'mi' },
    { id: 5, label: 'm' },
    { id: 6, label: 'km' },
    { id: 7, label: 'lb' },
]

export const EditWorkout = () => {
    const { workoutId } = useParams()
    const navigate = useNavigate()
    const { getAccessTokenSilently, isAuthenticated } = useAuth0()
    const { customAuth, userRole } = useCustomAuth()
    const [workoutMeta, setWorkoutMeta] = useState(null)
    const [availableExercises, setAvailableExercises] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    const [workoutName, setWorkoutName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageUploading, setImageUploading] = useState(false);
    const [imageError, setImageError] = useState('');
    const [imageDragOver, setImageDragOver] = useState(false);
    const [experienceLevel, setExperienceLevel] = useState(null);
    const [fitnessGoal, setFitnessGoal] = useState(null);
    const [equipmentRequired, setEquipmentRequired] = useState('');
    const [workoutTime, setWorkoutTime] = useState('');
    const [workoutDuration, setWorkoutDuration] = useState('');
    const [exercises, setExercises] = useState([]);
    const [dragIndex, setDragIndex] = useState(null);

    useEffect(() => {
        const fetchEditData = async () => {
            try {
                let token

                if (isAuthenticated) {
                    token = await getAccessTokenSilently({
                        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
                    })
                } else if (customAuth) {
                    token = customAuth
                } else {
                    setError('Log in to edit workout plans.')
                    setLoading(false)
                    return
                }

                const [workoutResponse, exercisesResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/workouts/${workoutId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_BASE_URL}/exercises`),
                ])

                if (!workoutResponse.ok) {
                    throw new Error(`Failed to load workout (${workoutResponse.status})`)
                }
                if (!exercisesResponse.ok) {
                    throw new Error(`Failed to load exercises (${exercisesResponse.status})`)
                }

                const workoutData = await workoutResponse.json()
                const exerciseOptions = await exercisesResponse.json()

                setWorkoutMeta(workoutData)
                setAvailableExercises(exerciseOptions)
                setWorkoutName(workoutData.name || '')
                setImageUrl(workoutData.image_url || '')
                setExperienceLevel(workoutData.experience_level_id ?? null)
                setFitnessGoal(workoutData.goal_type_id ?? null)
                setEquipmentRequired(workoutData.equipment_required || '')
                setWorkoutTime(workoutData.workout_time_mins?.toString() || '')
                setWorkoutDuration(workoutData.intended_duration_weeks?.toString() || '')
                setExercises(
                    workoutData.exercises.map((exercise, index) => ({
                        rowId: `${exercise.exercise_id}-${index}`,
                        exercise_id: exercise.exercise_id,
                        exercise_name: exercise.exercise_name,
                        sets: exercise.sets?.toString() || '',
                        target_value: exercise.target_value?.toString() || '',
                        unit_id: exercise.unit_id,
                        rest: exercise.rest?.toString() || '',
                    }))
                )
            } catch (err) {
                setError(err.message || 'Unable to load workout plan.')
            } finally {
                setLoading(false)
            }
        }

        fetchEditData()
    }, [customAuth, getAccessTokenSilently, isAuthenticated, workoutId])

    const uploadImageFile = async (file) => {
        if (!file) return
        setImageError('')
        setImageUploading(true)
        try {
            let token
            if (isAuthenticated) {
                token = await getAccessTokenSilently({
                    authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
                })
            } else if (customAuth) {
                token = customAuth
            } else {
                throw new Error('Log in to upload images.')
            }
            const formData = new FormData()
            formData.append('image', file)
            const res = await fetch(`${API_BASE_URL}/workouts/${workoutId}/image`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.detail || 'Upload failed')
            setImageUrl(data.image_url)
        } catch (err) {
            setImageError(err.message || 'Image upload failed.')
        } finally {
            setImageUploading(false)
        }
    }

    const handleImageUpload = (e) => uploadImageFile(e.target.files?.[0])

    const handleImageDrop = (e) => {
        e.preventDefault()
        setImageDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) uploadImageFile(file)
    }

    const handleDragStart = (index) => {
        setDragIndex(index)
    }

    const handleDragOver = (e) => {
        e.preventDefault();
    }

    const handleDrop = (index) => {
        const newItems = [...exercises];
        const draggedItem = newItems[dragIndex];
        newItems.splice(dragIndex, 1);
        newItems.splice(index, 0, draggedItem);
        setExercises(newItems);
        setDragIndex(null);
    }

    const updateExerciseField = (index, field, value) => {
        setExercises((prev) =>
            prev.map((exercise, exerciseIndex) => {
                if (exerciseIndex !== index) {
                    return exercise
                }

                if (field === 'exercise_id') {
                    const selectedExercise = availableExercises.find(
                        (option) => option.exercise_id === Number(value)
                    )
                    return {
                        ...exercise,
                        exercise_id: Number(value),
                        exercise_name: selectedExercise?.name || exercise.exercise_name,
                    }
                }

                if (field === 'unit_id') {
                    return { ...exercise, unit_id: Number(value) }
                }

                return { ...exercise, [field]: value }
            })
        )
    }

    const handleAddExercise = () => {
        const firstExercise = availableExercises[0]
        setExercises((prev) => [
            ...prev,
            {
                rowId: `new-${Date.now()}`,
                exercise_id: firstExercise?.exercise_id || 0,
                exercise_name: firstExercise?.name || '',
                sets: '',
                target_value: '',
                unit_id: 1,
                rest: '',
            },
        ])
    }

    const handleSaveWorkout = async () => {
        try {
            setSaving(true)
            setError('')

            let token
            if (isAuthenticated) {
                token = await getAccessTokenSilently({
                    authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
                })
            } else if (customAuth) {
                token = customAuth
            } else {
                throw new Error('Log in to save workout plans.')
            }

            const payload = {
                name: workoutName,
                goal_type_id: fitnessGoal || null,
                experience_level_id: experienceLevel || null,
                equipment_required: equipmentRequired || null,
                workout_time_mins: workoutTime ? Number(workoutTime) : null,
                intended_duration_weeks: workoutDuration ? Number(workoutDuration) : null,
                image_url: imageUrl || null,
                assigned_to: workoutMeta?.assigned_to || null,
                exercises: exercises.map((exercise, index) => ({
                    exercise_id: Number(exercise.exercise_id),
                    sets: exercise.sets ? Number(exercise.sets) : null,
                    target_value: exercise.target_value ? Number(exercise.target_value) : null,
                    unit_id: Number(exercise.unit_id),
                    order_in_workout: index + 1,
                    rest: exercise.rest ? Number(exercise.rest) : null,
                })),
            }

            const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const responseBody = await response.json().catch(() => ({}))
                throw new Error(responseBody.detail || `Failed to save workout (${response.status})`)
            }

            navigate(userRole === 'admin' ? '/dashboard/admin' : `/view-workout/${workoutId}`)
        } catch (err) {
            setError(err.message || 'Unable to save workout plan.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div>
            <div className="workouts-container">
                <Sidebar />

                <div className="workouts-content">
                    <div className="page-heading">
                        <div className="h2">
                            <span className="text-black">Create / Edit </span>
                            <span className="text-purple">Workout Plan</span>
                        </div>
                    </div>

                    <div className="edit-exercises-container">
                        {loading && <p className="state-message loading">Loading workout plan...</p>}
                        {error && <p style={{ color: '#b91c1c' }}>{error}</p>}

                        <div className="workout-textbox-container">
                            <div className="form-group full-width">
                                <label className="h3">Workout name:</label>
                                <textarea
                                    className="form-input"
                                    placeholder="WORKOUT NAME HERE"
                                    value={workoutName}
                                    onChange={(e) => setWorkoutName(e.target.value)}
                                />
                            </div>
                            <div className="form-group full-width">
                                <label className="h3">Workout Image:</label>
                                <label
                                    className={`image-drop-zone ${imageDragOver ? 'drag-over' : ''} ${imageUploading ? 'uploading' : ''}`}
                                    onDragOver={(e) => { e.preventDefault(); setImageDragOver(true) }}
                                    onDragLeave={() => setImageDragOver(false)}
                                    onDrop={handleImageDrop}
                                >
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        style={{ display: 'none' }}
                                        onChange={handleImageUpload}
                                        disabled={imageUploading}
                                    />
                                    {imageUploading ? (
                                        <span className="drop-zone-text">Uploading...</span>
                                    ) : imageUrl ? (
                                        <img src={imageUrl} alt="Workout preview" className="drop-zone-preview" />
                                    ) : (
                                        <span className="drop-zone-text">Drag & drop an image or click to browse</span>
                                    )}
                                </label>
                                {imageError && <p style={{ fontSize: '13px', color: '#b91c1c', marginTop: '4px' }}>{imageError}</p>}
                            </div>
                        </div>

                        <table className="workout-table">
                            <thead>
                                <tr>
                                    <th>Exercise</th>
                                    <th>Sets</th>
                                    <th>Target</th>
                                    <th>Unit</th>
                                    <th>Rest</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {exercises.map((item, index) => (
                                    <tr
                                        key={item.rowId}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={handleDragOver}
                                        onDrop={() => handleDrop(index)}
                                        className={index === dragIndex ? "exercise-row-dragging" : "exercise-row-draggable"}
                                    >
                                        <td>
                                            <select
                                                className="form-input"
                                                value={item.exercise_id}
                                                onChange={(e) => updateExerciseField(index, 'exercise_id', e.target.value)}
                                            >
                                                {availableExercises.map((exercise) => (
                                                    <option key={exercise.exercise_id} value={exercise.exercise_id}>
                                                        {exercise.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={item.sets}
                                                onChange={(e) => updateExerciseField(index, 'sets', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={item.target_value}
                                                onChange={(e) => updateExerciseField(index, 'target_value', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                className="form-input"
                                                value={item.unit_id}
                                                onChange={(e) => updateExerciseField(index, 'unit_id', e.target.value)}
                                            >
                                                {UNIT_OPTIONS.map((unit) => (
                                                    <option key={unit.id} value={unit.id}>
                                                        {unit.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={item.rest}
                                                onChange={(e) => updateExerciseField(index, 'rest', e.target.value)}
                                            />
                                        </td>
                                        <td><MdDragHandle className="drag-icon" /></td>
                                    </tr>
                                ))}
                            </tbody>
                            <button className="btn" type="button" onClick={handleAddExercise}>
                                Add new exercise
                            </button>
                        </table>

                        

                        <div className="workout-textbox-container">
                            <div className="edit-workout-group">
                                <label className="h3">Experience Level</label>
                                <div className="pill-selector">
                                    {EXPERIENCE_OPTIONS.map((level) => (
                                        <div
                                            key={level.id}
                                            className={`pill-option ${experienceLevel === level.id ? 'selected' : ''}`}
                                            onClick={() => setExperienceLevel(level.id)}
                                        >
                                            {level.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="edit-workout-group">
                                <label className="h3">Fitness Goal</label>
                                <div className="pill-selector">
                                    {GOAL_OPTIONS.map((goal) => (
                                        <div
                                            key={goal.id}
                                            className={`pill-option ${fitnessGoal === goal.id ? 'selected' : ''}`}
                                            onClick={() => setFitnessGoal(goal.id)}
                                        >
                                            {goal.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="edit-workout-group">
                                <label className="h3">Equipment Required</label>
                                <div className="pill-selector">
                                    {['Dumbbells', 'Body Weight', 'Cable', 'Machine', 'Other'].map((equipment) => (
                                        <div
                                            key={equipment}
                                            className={`pill-option ${equipmentRequired === equipment ? 'selected' : ''}`}
                                            onClick={() => setEquipmentRequired(equipment)}
                                        >
                                            {equipment}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="edit-workout-group">
                                <div className="edit-workout-dropdown-boxes">
                                    <div className="form-group">
                                        <label className="h3">Workout Time (Minutes)</label>
                                        <select className="form-input" value={workoutTime} onChange={(e) => setWorkoutTime(e.target.value)}>
                                            <option value="">Select</option>
                                            <option value="5">5</option>
                                            <option value="10">10</option>
                                            <option value="15">15</option>
                                            <option value="25">25</option>
                                            <option value="30">30</option>
                                            <option value="45">45</option>
                                            <option value="60">60</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="h3">Duration (Weeks)</label>
                                        <select className="form-input" value={workoutDuration} onChange={(e) => setWorkoutDuration(e.target.value)}>
                                            <option value="">Select</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                            <option value="5">5</option>
                                            <option value="6">6</option>
                                            <option value="7">7</option>
                                            <option value="8">8</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="workout-action-row">
                                <Link to={userRole === 'admin' ? '/dashboard/admin' : `/view-workout/${workoutId}`} className="edit-workout-plan-btn">
                                    <div className="btn">Cancel</div>
                                </Link>
                                <button
                                    className="btn"
                                    type="button"
                                    onClick={handleSaveWorkout}
                                    disabled={saving || loading}
                                >
                                    {saving ? 'Saving...' : 'Save Workout Plan'}
                                </button>
                            </div>

                            
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
