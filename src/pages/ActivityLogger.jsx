import React, { useEffect, useMemo, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { Sidebar } from '../components/Sidebar'
import { useCustomAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../utils/apiBaseUrl'

import './Pages.css'
import './ActivityLogger.css'

const DAILY_CHECKIN_MOODS = ['Amazing', 'Good', 'Okay', 'Bad', 'Awful']

const getLocalDateString = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const shiftDate = (dateString, deltaDays) => {
    const [year, month, day] = dateString.split('-').map(Number)
    const next = new Date(year, month - 1, day)
    next.setDate(next.getDate() + deltaDays)
    const nextYear = next.getFullYear()
    const nextMonth = String(next.getMonth() + 1).padStart(2, '0')
    const nextDay = String(next.getDate()).padStart(2, '0')
    return `${nextYear}-${nextMonth}-${nextDay}`
}

const formatDisplayDate = (dateString) =>
    new Date(`${dateString}T12:00:00`).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })

const readErrorDetail = async (response, fallbackMessage) => {
    const rawBody = await response.text().catch(() => '')
    if (!rawBody) return fallbackMessage

    if (rawBody.trimStart().toLowerCase().startsWith('<!doctype')) {
        return `${fallbackMessage} The API request returned the frontend HTML page instead of backend JSON.`
    }

    try {
        const parsed = JSON.parse(rawBody)
        return parsed.detail || parsed.message || fallbackMessage
    } catch {
        return rawBody
    }
}

const readJsonPayload = async (response, fallbackMessage) => {
    const rawBody = await response.text().catch(() => '')
    if (!rawBody) {
        throw new Error(fallbackMessage)
    }

    try {
        return JSON.parse(rawBody)
    } catch {
        if (rawBody.trimStart().toLowerCase().startsWith('<!doctype')) {
            throw new Error(`${fallbackMessage} The API request returned the frontend HTML page instead of backend JSON.`)
        }
        throw new Error(fallbackMessage)
    }
}

const parseOptionalNumber = (value) => {
    if (value === '' || value === null || value === undefined) return null
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

const getResultPlaceholder = (unitName) => {
    const normalized = (unitName || '').trim().toLowerCase()
    if (normalized === 'reps') return 'Reps'
    if (normalized === 'mins') return 'Minutes'
    if (normalized === 'hrs') return 'Hours'
    if (normalized === 'mi') return 'Miles'
    if (normalized === 'km') return 'Kilometers'
    if (normalized === 'm') return 'Meters'
    if (normalized === 'lb') return 'Pounds'
    return 'Value'
}

const hasMeaningfulExerciseValues = (exercise) =>
    parseOptionalNumber(exercise.actual_weight) !== null ||
    parseOptionalNumber(exercise.actual_value) !== null

const deriveExerciseStatus = (exercise) => {
    if (exercise.skipped) return 'Skipped'
    if (hasMeaningfulExerciseValues(exercise)) return 'Completed'
    return 'Scheduled'
}

const deriveWorkoutStatus = (workout) => {
    if (!workout.exercises.length) {
        return 'Scheduled'
    }

    const exerciseStatuses = workout.exercises.map(deriveExerciseStatus)
    if (exerciseStatuses.every((status) => status === 'Skipped')) {
        return 'Skipped'
    }
    if (exerciseStatuses.every((status) => status === 'Completed' || status === 'Skipped')) {
        return 'Completed'
    }
    if (exerciseStatuses.some((status) => status === 'Completed' || status === 'Skipped')) {
        return 'In Progress'
    }
    return 'Scheduled'
}

const buildWorkoutForms = (scheduledWorkouts, loggedWorkouts) => {
    const loggedMap = new Map(loggedWorkouts.map((log) => [log.workout_id, log]))
    const forms = scheduledWorkouts.map((scheduledWorkout) => {
        const logged = loggedMap.get(scheduledWorkout.workout_id)
        const loggedResults = new Map((logged?.set_results || []).map((result) => [result.exercise_id, result]))

        return {
            workout_id: scheduledWorkout.workout_id,
            workout_name: scheduledWorkout.name,
            workout_time_mins: scheduledWorkout.workout_time_mins,
            exercises: (scheduledWorkout.exercises || []).map((exercise) => {
                const existingResult = loggedResults.get(exercise.exercise_id)
                return {
                    exercise_id: exercise.exercise_id,
                    exercise_name: exercise.exercise_name,
                    category_name: exercise.category_name,
                    allow_weight_input: exercise.allow_weight_input !== false,
                    skipped: existingResult?.skipped || false,
                    sets: exercise.sets,
                    target_value: exercise.target_value,
                    unit_name: exercise.unit_name,
                    rest: exercise.rest,
                    actual_weight: existingResult?.actual_weight ?? '',
                    actual_value: existingResult?.actual_value ?? '',
                }
            }),
        }
    })

    loggedWorkouts.forEach((loggedWorkout) => {
        if (forms.some((workout) => workout.workout_id === loggedWorkout.workout_id)) {
            return
        }

        const loggedExercises = (loggedWorkout.set_results || []).map((result) => ({
            exercise_id: result.exercise_id,
            exercise_name: result.exercise_name || 'Exercise',
            category_name: null,
            allow_weight_input: result.actual_weight !== null && result.actual_weight !== undefined,
            sets: null,
            target_value: null,
            unit_name: null,
            rest: null,
            actual_weight: result.actual_weight ?? '',
            actual_value: result.actual_value ?? '',
        }))

        forms.push({
            workout_id: loggedWorkout.workout_id,
            workout_name: loggedWorkout.workout_name,
            status: deriveWorkoutStatus({ exercises: loggedExercises }, loggedWorkout.status || 'Completed'),
            workout_time_mins: null,
            exercises: loggedExercises,
        })
    })

    return forms.map((workout) => ({
        ...workout,
        status: deriveWorkoutStatus(workout),
    }))
}

const ActivityPhotoPanel = ({
    photos,
    isLocked,
    uploadType,
    setUploadType,
    uploadNote,
    setUploadNote,
    selectedFile,
    previewUrl,
    onFileChange,
    onUpload,
    onDelete,
    photoSubmitting,
    photoError,
}) => (
    <section className="section-card activity-section-card">
        <div className="section-title">Progress Photos For This Day</div>
        <p className="stat-descriptor">Upload before or after check-in photos for this log. When you reopen this day later, they will show up here.</p>

        {!isLocked && (
            <div className="activity-photo-form">
                <div className="activity-photo-form-grid">
                    <label className="form-group">
                        <span className="form-label">Photo Type</span>
                        <select className="form-input" value={uploadType} onChange={(event) => setUploadType(event.target.value)}>
                            <option value="before">Before</option>
                            <option value="after">After</option>
                        </select>
                    </label>
                    <label className="form-group">
                        <span className="form-label">Image</span>
                        <input className="form-input" type="file" accept="image/*" onChange={onFileChange} />
                    </label>
                </div>
                <label className="form-group full-width">
                    <span className="form-label">Note</span>
                    <textarea
                        className="form-input activity-photo-note-input"
                        value={uploadNote}
                        onChange={(event) => setUploadNote(event.target.value)}
                        placeholder="Front pose, morning check-in, end of week 2, etc."
                    />
                </label>
                {selectedFile && previewUrl && (
                    <div className="activity-photo-preview-card">
                        <img src={previewUrl} alt="Upload preview" className="activity-photo-preview-image" />
                        <div className="activity-photo-preview-meta">
                            <div className="activity-photo-tag">{uploadType}</div>
                            <div className="stat-descriptor">{selectedFile.name}</div>
                        </div>
                    </div>
                )}
                <div className="activity-photo-actions">
                    <button type="button" className="panel-btn-purple" onClick={onUpload} disabled={photoSubmitting}>
                        {photoSubmitting ? 'Uploading...' : 'Add Photo To Log'}
                    </button>
                </div>
            </div>
        )}

        {photoError && <p className="feedback-msg error">{photoError}</p>}

        {photos.length === 0 ? (
            <div className="activity-empty-state">
                <p>No photos attached to this day yet.</p>
            </div>
        ) : (
            <div className="activity-photo-grid">
                {photos.map((photo) => (
                    <div key={photo.progress_photo_id} className="activity-photo-card">
                        <img src={photo.image_url} alt={`${photo.photo_type} log`} className="activity-photo-image" />
                        <div className="activity-photo-card-meta">
                            <div className="activity-photo-card-topline">
                                <span className={`activity-photo-tag ${photo.photo_type}`}>{photo.photo_type}</span>
                                <span className="activity-photo-date">
                                    {new Date(`${photo.taken_on}T12:00:00`).toLocaleDateString()}
                                </span>
                            </div>
                            {photo.note && <p className="activity-photo-note">{photo.note}</p>}
                            {!isLocked && (
                                <button
                                    type="button"
                                    className="panel-btn-white activity-photo-delete"
                                    onClick={() => onDelete(photo.progress_photo_id)}
                                    disabled={photoSubmitting}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
    </section>
)

export const ActivityLogger = () => {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0()
    const { customAuth } = useCustomAuth()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const selectedDate = searchParams.get('date') || getLocalDateString()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [activityDay, setActivityDay] = useState(null)
    const [progressPhotoFile, setProgressPhotoFile] = useState(null)
    const [progressPhotoPreviewUrl, setProgressPhotoPreviewUrl] = useState('')
    const [progressPhotoType, setProgressPhotoType] = useState('before')
    const [progressPhotoNote, setProgressPhotoNote] = useState('')
    const [photoSubmitting, setPhotoSubmitting] = useState(false)
    const [photoError, setPhotoError] = useState('')
    const [surveyForm, setSurveyForm] = useState({
        step_count: '',
        calories_intake: '',
        calories_burned: '',
        water_intake: '',
        weight_lb: '',
        mood_label: 'Okay',
        notes: '',
    })
    const [workoutForms, setWorkoutForms] = useState([])
    const isPastDate = selectedDate < getLocalDateString()
    const isHistoryView = isPastDate && activityDay?.has_logged_data
    const isLocked = isPastDate

    const getAuthToken = async () => {
        if (isAuthenticated) {
            return getAccessTokenSilently({
                authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
            })
        }
        if (customAuth) {
            return customAuth
        }
        throw new Error('You must be logged in to use the activity logger.')
    }

    useEffect(() => {
        const fetchActivityDay = async () => {
            setLoading(true)
            setError('')
            setSuccess('')

            try {
                const token = await getAuthToken()
                const response = await fetch(`${API_BASE_URL}/logs/activity-day?date=${selectedDate}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })

                if (!response.ok) {
                    throw new Error(await readErrorDetail(response, 'Unable to load activity logger.'))
                }

                const payload = await readJsonPayload(response, 'Unable to load activity logger.')
                setActivityDay(payload)
                setPhotoError('')
                setSurveyForm({
                    step_count: payload.daily_survey?.step_count ?? '',
                    calories_intake: payload.daily_survey?.calories_intake ?? '',
                    calories_burned: payload.daily_survey?.calories_burned ?? '',
                    water_intake: payload.daily_survey?.water_intake ?? '',
                    weight_lb: payload.daily_survey?.weight_lb ?? '',
                    mood_label: payload.daily_survey?.mood_label || payload.mood_options?.[0]?.mood_label || 'Okay',
                    notes: payload.daily_survey?.notes || '',
                })
                setWorkoutForms(buildWorkoutForms(payload.scheduled_workouts || [], payload.logged_workouts || []))
            } catch (fetchError) {
                setError(fetchError.message || 'Unable to load activity logger.')
                setActivityDay(null)
                setWorkoutForms([])
            } finally {
                setLoading(false)
            }
        }

        fetchActivityDay()
    }, [selectedDate, isAuthenticated, customAuth, getAccessTokenSilently])

    const moodOptions = useMemo(() => {
        const backendOptions = activityDay?.mood_options?.map((option) => option.mood_label) || []
        const merged = [...DAILY_CHECKIN_MOODS]
        backendOptions.forEach((option) => {
            if (option && !merged.includes(option)) {
                merged.push(option)
            }
        })
        return merged
    }, [activityDay])

    const setDate = (nextDate) => {
        const nextParams = new URLSearchParams(searchParams)
        nextParams.set('date', nextDate)
        setSearchParams(nextParams)
    }

    const updateSurveyField = (field) => (event) => {
        if (isLocked) return
        setSurveyForm((current) => ({ ...current, [field]: event.target.value }))
    }

    const updateExerciseField = (workoutId, exerciseId, field, value) => {
        if (isLocked) return
        setWorkoutForms((current) =>
            current.map((workout) => {
                if (workout.workout_id !== workoutId) return workout
                const nextExercises = workout.exercises.map((exercise) =>
                    exercise.exercise_id === exerciseId
                        ? { ...exercise, skipped: false, [field]: value }
                        : exercise
                )
                return {
                    ...workout,
                    status: deriveWorkoutStatus({ ...workout, exercises: nextExercises }),
                    exercises: nextExercises,
                }
            })
        )
    }

    const toggleExerciseSkipped = (workoutId, exerciseId) => {
        if (isLocked) return
        setWorkoutForms((current) =>
            current.map((workout) => {
                if (workout.workout_id !== workoutId) return workout
                const nextExercises = workout.exercises.map((exercise) => {
                    if (exercise.exercise_id !== exerciseId) return exercise
                    const nextSkipped = !exercise.skipped
                    return {
                        ...exercise,
                        skipped: nextSkipped,
                        actual_weight: nextSkipped ? '' : exercise.actual_weight,
                        actual_value: nextSkipped ? '' : exercise.actual_value,
                    }
                })
                return {
                    ...workout,
                    status: deriveWorkoutStatus({ ...workout, exercises: nextExercises }),
                    exercises: nextExercises,
                }
            })
        )
    }

    const saveActivityDay = async () => {
        if (isLocked) return
        setSaving(true)
        setError('')
        setSuccess('')

        try {
            const token = await getAuthToken()
            const payload = {
                daily_survey: {
                    step_count: parseOptionalNumber(surveyForm.step_count),
                    calories_intake: parseOptionalNumber(surveyForm.calories_intake),
                    calories_burned: parseOptionalNumber(surveyForm.calories_burned),
                    water_intake: parseOptionalNumber(surveyForm.water_intake),
                    weight_lb: parseOptionalNumber(surveyForm.weight_lb),
                    mood_label: surveyForm.mood_label || null,
                    notes: surveyForm.notes.trim() || null,
                },
                workout_logs: workoutForms
                    .filter((workout) => workout.exercises.some((exercise) => exercise.skipped || hasMeaningfulExerciseValues(exercise)))
                    .map((workout) => ({
                        workout_id: workout.workout_id,
                        set_results: workout.exercises
                            .filter((exercise) => exercise.skipped || hasMeaningfulExerciseValues(exercise))
                            .map((exercise) => ({
                                exercise_id: exercise.exercise_id,
                                skipped: exercise.skipped,
                                actual_weight: exercise.skipped ? null : parseOptionalNumber(exercise.actual_weight),
                                actual_value: exercise.skipped ? null : parseOptionalNumber(exercise.actual_value),
                            })),
                    })),
            }

            const response = await fetch(`${API_BASE_URL}/logs/activity-day?date=${selectedDate}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                throw new Error(await readErrorDetail(response, 'Unable to save activity logger.'))
            }

            const updated = await readJsonPayload(response, 'Unable to save activity logger.')
            setActivityDay(updated)
            setSurveyForm({
                step_count: updated.daily_survey?.step_count ?? '',
                calories_intake: updated.daily_survey?.calories_intake ?? '',
                calories_burned: updated.daily_survey?.calories_burned ?? '',
                water_intake: updated.daily_survey?.water_intake ?? '',
                weight_lb: updated.daily_survey?.weight_lb ?? '',
                mood_label: updated.daily_survey?.mood_label || updated.mood_options?.[0]?.mood_label || 'Okay',
                notes: updated.daily_survey?.notes || '',
            })
            setWorkoutForms(buildWorkoutForms(updated.scheduled_workouts || [], updated.logged_workouts || []))
            navigate('/view-progress')
        } catch (saveError) {
            setError(saveError.message || 'Unable to save activity logger.')
        } finally {
            setSaving(false)
        }
    }

    const clearPhotoDraft = () => {
        setProgressPhotoFile(null)
        setProgressPhotoPreviewUrl('')
        setProgressPhotoType('before')
        setProgressPhotoNote('')
    }

    const handlePhotoFileChange = (event) => {
        if (isLocked) return
        const file = event.target.files?.[0] || null
        setProgressPhotoFile(file)
        setPhotoError('')

        if (!file) {
            setProgressPhotoPreviewUrl('')
            return
        }

        const nextPreviewUrl = URL.createObjectURL(file)
        setProgressPhotoPreviewUrl((current) => {
            if (current) URL.revokeObjectURL(current)
            return nextPreviewUrl
        })
    }

    const uploadProgressPhoto = async () => {
        if (isLocked) return
        if (!progressPhotoFile) {
            setPhotoError('Choose an image before uploading.')
            return
        }

        setPhotoSubmitting(true)
        setPhotoError('')
        setError('')
        setSuccess('')

        try {
            const token = await getAuthToken()
            const formData = new FormData()
            formData.append('photo_type', progressPhotoType)
            formData.append('note', progressPhotoNote)
            formData.append('image', progressPhotoFile)

            const response = await fetch(`${API_BASE_URL}/logs/activity-day/photos?date=${selectedDate}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            })

            const body = await response.json().catch(() => ({}))
            if (!response.ok) {
                throw new Error(body.detail || 'Unable to upload progress photo.')
            }

            setActivityDay((current) => ({
                ...current,
                has_logged_data: true,
                can_delete: selectedDate === getLocalDateString(),
                progress_photos: [body, ...(current?.progress_photos || [])],
            }))
            clearPhotoDraft()
            setSuccess('Photo added to this day\'s log.')
        } catch (uploadError) {
            setPhotoError(uploadError.message || 'Unable to upload progress photo.')
        } finally {
            setPhotoSubmitting(false)
        }
    }

    const deleteProgressPhoto = async (progressPhotoId) => {
        if (isLocked) return

        setPhotoSubmitting(true)
        setPhotoError('')
        setError('')
        setSuccess('')

        try {
            const token = await getAuthToken()
            const response = await fetch(`${API_BASE_URL}/logs/activity-day/photos/${progressPhotoId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })

            if (!response.ok) {
                throw new Error(await readErrorDetail(response, 'Unable to delete progress photo.'))
            }

            setActivityDay((current) => {
                const nextPhotos = (current?.progress_photos || []).filter((photo) => photo.progress_photo_id !== progressPhotoId)
                return {
                    ...current,
                    progress_photos: nextPhotos,
                    has_logged_data: Boolean(
                        current?.daily_survey ||
                        (current?.logged_workouts || []).length ||
                        nextPhotos.length
                    ),
                }
            })
            setSuccess('Photo removed from this day\'s log.')
        } catch (deleteError) {
            setPhotoError(deleteError.message || 'Unable to delete progress photo.')
        } finally {
            setPhotoSubmitting(false)
        }
    }

    useEffect(() => () => {
        if (progressPhotoPreviewUrl) {
            URL.revokeObjectURL(progressPhotoPreviewUrl)
        }
    }, [progressPhotoPreviewUrl])

    useEffect(() => {
        clearPhotoDraft()
        setPhotoError('')
    }, [selectedDate])

    const deleteActivityDay = async () => {
        if (!activityDay?.can_delete) return

        setSaving(true)
        setError('')
        setSuccess('')

        try {
            const token = await getAuthToken()
            const response = await fetch(`${API_BASE_URL}/logs/activity-day?date=${selectedDate}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })

            if (!response.ok) {
                throw new Error(await readErrorDetail(response, 'Unable to delete today\'s activity log.'))
            }

            const updated = await readJsonPayload(response, 'Unable to delete today\'s activity log.')
            setActivityDay(updated)
            setSurveyForm({
                step_count: updated.daily_survey?.step_count ?? '',
                calories_intake: updated.daily_survey?.calories_intake ?? '',
                calories_burned: updated.daily_survey?.calories_burned ?? '',
                water_intake: updated.daily_survey?.water_intake ?? '',
                weight_lb: updated.daily_survey?.weight_lb ?? '',
                mood_label: updated.daily_survey?.mood_label || updated.mood_options?.[0]?.mood_label || 'Okay',
                notes: updated.daily_survey?.notes || '',
            })
            setWorkoutForms(buildWorkoutForms(updated.scheduled_workouts || [], updated.logged_workouts || []))
            setSuccess('Today\'s activity log was deleted.')
        } catch (deleteError) {
            setError(deleteError.message || 'Unable to delete today\'s activity log.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="activity-logger-page">
                <div className="page-heading">
                    <div className="h2">
                        <span className="text-black">Activity </span>
                        <span className="text-purple">Logger</span>
                    </div>
                </div>

                <div className="activity-logger-content">
                    <div className="activity-date-bar">
                        <button type="button" className="activity-date-btn" onClick={() => setDate(shiftDate(selectedDate, -1))}>Prev Day</button>
                        <div className="activity-date-center">
                            <div className="activity-date-label">{formatDisplayDate(selectedDate)}</div>
                            <input
                                className="activity-date-input"
                                type="date"
                                value={selectedDate}
                                onChange={(event) => setDate(event.target.value)}
                            />
                        </div>
                        <button type="button" className="activity-date-btn" onClick={() => setDate(getLocalDateString())}>Today</button>
                        <button type="button" className="activity-date-btn" onClick={() => setDate(shiftDate(selectedDate, 1))}>Next Day</button>
                    </div>

                    {loading && <p className="stat-descriptor">Loading activity log...</p>}
                    {!loading && error && <p className="feedback-msg error">{error}</p>}
                    {!loading && success && <p className="feedback-msg success">{success}</p>}

                    {!loading && activityDay && (
                        <>
                            <div className="activity-top-grid">
                                <section className="section-card activity-section-card">
                                    <div className="section-title">Daily Stats</div>
                                    {isHistoryView && (
                                        <div className="activity-history-banner">
                                            This is a saved past-day log. You can review it here, but historical entries stay locked.
                                        </div>
                                    )}
                                    {!activityDay.has_logged_data && isPastDate && (
                                        <div className="activity-history-banner">
                                            No submitted log exists for this date.
                                        </div>
                                    )}
                                    <div className="form-grid">
                                        <label className="form-group">
                                            <span className="form-label">Steps</span>
                                            <input className="form-input" type="number" min="0" value={surveyForm.step_count} onChange={updateSurveyField('step_count')} placeholder="9000" disabled={isLocked} />
                                        </label>
                                        <label className="form-group">
                                            <span className="form-label">Calories In</span>
                                            <input className="form-input" type="number" min="0" value={surveyForm.calories_intake} onChange={updateSurveyField('calories_intake')} placeholder="2100" disabled={isLocked} />
                                        </label>
                                        <label className="form-group">
                                            <span className="form-label">Calories Burned</span>
                                            <input className="form-input" type="number" min="0" value={surveyForm.calories_burned} onChange={updateSurveyField('calories_burned')} placeholder="450" disabled={isLocked} />
                                        </label>
                                        <label className="form-group">
                                            <span className="form-label">Water (glasses)</span>
                                            <input className="form-input" type="number" min="0" value={surveyForm.water_intake} onChange={updateSurveyField('water_intake')} placeholder="8" disabled={isLocked} />
                                        </label>
                                        <label className="form-group">
                                            <span className="form-label">Weight (LB)</span>
                                            <input className="form-input" type="number" min="0" step="0.1" value={surveyForm.weight_lb} onChange={updateSurveyField('weight_lb')} placeholder="178.4" disabled={isLocked} />
                                        </label>
                                        <label className="form-group">
                                            <span className="form-label">Mood</span>
                                            <select className="form-input" value={surveyForm.mood_label} onChange={updateSurveyField('mood_label')} disabled={isLocked}>
                                                {moodOptions.map((mood) => (
                                                    <option key={mood} value={mood}>{mood}</option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="form-group full-width">
                                            <span className="form-label">Notes</span>
                                            <textarea className="form-input activity-notes-input" value={surveyForm.notes} onChange={updateSurveyField('notes')} placeholder="How did training feel today?" disabled={isLocked} />
                                        </label>
                                    </div>
                            </section>

                            <ActivityPhotoPanel
                                photos={activityDay.progress_photos || []}
                                isLocked={isLocked}
                                uploadType={progressPhotoType}
                                setUploadType={setProgressPhotoType}
                                uploadNote={progressPhotoNote}
                                setUploadNote={setProgressPhotoNote}
                                selectedFile={progressPhotoFile}
                                previewUrl={progressPhotoPreviewUrl}
                                onFileChange={handlePhotoFileChange}
                                onUpload={uploadProgressPhoto}
                                onDelete={deleteProgressPhoto}
                                photoSubmitting={photoSubmitting}
                                photoError={photoError}
                            />

                            <section className="section-card activity-section-card">
                                    <div className="section-title">Today&apos;s Focus</div>
                                    <div className="activity-goals">
                                        {activityDay.goals?.length ? (
                                            activityDay.goals.map((goal) => (
                                                <span key={goal.goal_id} className="activity-goal-pill">{goal.goal_type_name}</span>
                                            ))
                                        ) : (
                                            <p className="stat-descriptor">No goals set yet. Your daily stats and workouts will still be saved here.</p>
                                        )}
                                    </div>
                                    <div className="activity-helper-card">
                                        <div className="stat-heading">Planned Workouts</div>
                                        <div className="activity-helper-value">{activityDay.scheduled_workouts.length}</div>
                                        <p className="stat-descriptor">Mark a workout completed to save your strength log for the selected day.</p>
                                    </div>
                                </section>
                            </div>

                            <section className="section-card activity-section-card">
                                <div className="section-title">Strength & Planned Workouts</div>
                                {workoutForms.length === 0 ? (
                                    <div className="activity-empty-state">
                                        <p>No workouts are scheduled for this day yet.</p>
                                        <Link to="/calendar" className="panel-btn-purple">Open Calendar</Link>
                                    </div>
                                ) : (
                                    <div className="activity-workout-list">
                                        {workoutForms.map((workout) => (
                                            <div key={workout.workout_id} className="activity-workout-card">
                                                <div className="activity-workout-header">
                                                    <div>
                                                        <div className="activity-workout-title">{workout.workout_name}</div>
                                                        <div className="stat-descriptor">
                                                            {workout.workout_time_mins ? `${workout.workout_time_mins} min session` : 'Workout session'}
                                                        </div>
                                                    </div>
                                                    <label className="form-group activity-status-group">
                                                        <span className="form-label">Workout Status</span>
                                                        <div className="activity-status-stack">
                                                            <div className={`activity-status-pill ${workout.status === 'Completed' ? 'completed' : workout.status === 'In Progress' ? 'in-progress' : workout.status === 'Skipped' ? 'skipped' : 'scheduled'}`}>
                                                                {workout.status === 'Completed'
                                                                    ? 'Completed from logged values'
                                                                    : workout.status === 'In Progress'
                                                                        ? 'In progress'
                                                                    : workout.status === 'Skipped'
                                                                        ? 'All exercises skipped'
                                                                        : 'Scheduled'}
                                                            </div>
                                                        </div>
                                                    </label>
                                                </div>

                                                <div className="activity-exercise-table">
                                                    <div className="activity-exercise-table-head">
                                                        <span>Exercise</span>
                                                        <span>Target</span>
                                                        <span>Exercise Status</span>
                                                        <span>Actual Weight (LB)</span>
                                                        <span>Actual Reps / Value</span>
                                                    </div>
                                                    {workout.exercises.map((exercise) => (
                                                        <div key={`${workout.workout_id}-${exercise.exercise_id}`} className="activity-exercise-row">
                                                            <div>
                                                                <div className="activity-exercise-name">{exercise.exercise_name}</div>
                                                                <div className="stat-descriptor">
                                                                    {exercise.sets ? `${exercise.sets} sets` : 'Logged exercise'}
                                                                    {exercise.rest ? ` • ${exercise.rest}s rest` : ''}
                                                                </div>
                                                            </div>
                                                            <div className="activity-target-value">
                                                                {exercise.target_value ?? '—'} {exercise.unit_name || ''}
                                                            </div>
                                                            <div className="activity-exercise-state">
                                                                <div className={`activity-status-pill ${deriveExerciseStatus(exercise) === 'Completed' ? 'completed' : deriveExerciseStatus(exercise) === 'Skipped' ? 'skipped' : 'scheduled'}`}>
                                                                    {deriveExerciseStatus(exercise)}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className={`activity-skip-btn ${exercise.skipped ? 'active' : ''}`}
                                                                    onClick={() => toggleExerciseSkipped(workout.workout_id, exercise.exercise_id)}
                                                                    disabled={isLocked}
                                                                >
                                                                    {exercise.skipped ? 'Undo Skip' : 'Skip'}
                                                                </button>
                                                            </div>
                                                            {exercise.allow_weight_input ? (
                                                                <input
                                                                    className="form-input activity-metric-input"
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.1"
                                                                    value={exercise.actual_weight}
                                                                    onChange={(event) => updateExerciseField(workout.workout_id, exercise.exercise_id, 'actual_weight', event.target.value)}
                                                                    placeholder="Weight (LB)"
                                                                    disabled={exercise.skipped || isLocked}
                                                                />
                                                            ) : (
                                                                <div className="activity-na-field">Not needed</div>
                                                            )}
                                                            <input
                                                                className="form-input activity-metric-input"
                                                                type="number"
                                                                min="0"
                                                                step="0.1"
                                                                value={exercise.actual_value}
                                                                onChange={(event) => updateExerciseField(workout.workout_id, exercise.exercise_id, 'actual_value', event.target.value)}
                                                                placeholder={getResultPlaceholder(exercise.unit_name)}
                                                                disabled={exercise.skipped || isLocked}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <div className="activity-actions">
                                {activityDay.can_delete && (
                                    <button
                                        type="button"
                                        className="panel-btn-white"
                                        onClick={deleteActivityDay}
                                        disabled={saving}
                                    >
                                        Delete Today&apos;s Log
                                    </button>
                                )}
                                <button type="button" className="panel-btn-white" onClick={() => setDate(getLocalDateString())}>Jump To Today</button>
                                <button type="button" className="panel-btn-purple" onClick={saveActivityDay} disabled={saving || isLocked}>
                                    {saving ? 'Saving...' : 'Save Activity Log'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
