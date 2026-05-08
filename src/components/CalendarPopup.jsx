import './CalendarPopup.css'
import React, { useEffect, useState } from "react"
import moment from 'moment'

export const CalendarPopup = ({ isOpen, onClose, onSave, onDelete, date, event, workouts, submitting, preselectedWorkoutId = null, clientName = null }) => {
    const [workoutId, setWorkoutId] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');

    useEffect(() => {
        if (event) {
            setWorkoutId(event.workoutId.toString());
            setScheduledDate(event.scheduledDate);
        } else if (date) {
            const defaultId = preselectedWorkoutId
                ? preselectedWorkoutId.toString()
                : (workouts[0]?.workout_id?.toString() || '')
            setWorkoutId(defaultId);
            setScheduledDate(moment(date).format('YYYY-MM-DD'));
        }
    }, [event, date, workouts, preselectedWorkoutId])

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave({
            workoutId: Number(workoutId),
            scheduledDate,
        })
    }

    return (
        <div className="coach-modal-overlay" onClick={onClose}>
            <div className="coach-modal" onClick={(e) => e.stopPropagation()}>
                <div className="coach-modal-header">
                    <div className="dashboard-heading coach-modal-title">
                        {event ? 'Edit Workout' : 'Schedule Workout'}
                    </div>
                    <button type="button" className="coach-modal-close" onClick={onClose}>X</button>
                </div>

                {clientName && !event && (
                    <p className="stat-descriptor calendar-client-for">for {clientName}</p>
                )}

                <form onSubmit={handleSubmit} className="calendar-popup-form">
                    <div className="calendar-field">
                        <label className="stat-heading">Workout</label>
                        <select
                            className="calendar-form-input"
                            required
                            value={workoutId}
                            onChange={(e) => setWorkoutId(e.target.value)}
                        >
                            <option value="" disabled>Select a workout</option>
                            {workouts.map((workout) => (
                                <option key={workout.workout_id} value={workout.workout_id}>
                                    {workout.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="calendar-field">
                        <label className="stat-heading">Date</label>
                        <input
                            className="calendar-form-input"
                            type="date"
                            required
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                        />
                    </div>

                    <div className="calendar-popup-actions">
                        <button className="panel-btn-white" type="button" onClick={onClose} disabled={submitting}>
                            Cancel
                        </button>
                        <button className="panel-btn-purple" type="submit" disabled={submitting}>
                            {submitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>

                    {event && (
                        <button
                            className="panel-btn-fire calendar-delete-btn"
                            type="button"
                            onClick={() => onDelete(event)}
                            disabled={submitting}
                        >
                            {submitting ? 'Deleting...' : 'Delete Workout'}
                        </button>
                    )}
                </form>
            </div>
        </div>
    )
}
