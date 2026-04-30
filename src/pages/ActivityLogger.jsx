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

    try {
        const parsed = JSON.parse(rawBody)
        return parsed.detail || parsed.message || fallbackMessage
    } catch {
        return rawBody
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

                const payload = await response.json()
                setActivityDay(payload)
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

            const updated = await response.json()
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

            const updated = await response.json()
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
