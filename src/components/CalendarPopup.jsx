import './CalendarPopup.css'
import React, { useEffect, useState } from "react"
import moment from 'moment'

export const CalendarPopup = ({ isOpen, onClose, onSave, onDelete, date, event, workouts, submitting }) => {
    const [workoutId, setWorkoutId] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');

    useEffect(() => {
        if (event) {
            setWorkoutId(event.workoutId.toString());
            setScheduledDate(event.scheduledDate);
        } else if (date) {
            setWorkoutId(workouts[0]?.workout_id?.toString() || '');
            setScheduledDate(moment(date).format('YYYY-MM-DD'));
        }
    }, [event, date, workouts])

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave({
            workoutId: Number(workoutId),
            scheduledDate,
        })
    }

    return (
        <div className="calendar-popup-background">
            <div className="calendar-popup-container">
                <div className="h3">{event ? "Edit workout" : "Add Workout"}</div>

                <form onSubmit={handleSubmit}>
                    <div className="calendar-popup-contents">
                        <label className="calendar-form-label" >Workout: </label>
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

                    <div className="calendar-popup-contents">
                        <label className="calendar-form-label">Date:</label>
                        <input
                            className="calendar-form-input"
                            type="date"
                            required
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                        />
                    </div>

                    <button className="calendar-btn" type="submit" disabled={submitting}>Save</button>
                    <button className="calendar-btn-outline" type="button" onClick={onClose} disabled={submitting}>Cancel</button>

                    {event && (
                        <button
                            className="calendar-btn-delete"
                            type="button"
                            onClick={() => onDelete(event)}
                            disabled={submitting}
                        >
                            Delete
                        </button>
                    )}
                </form>
            </div>
        </div>
    )
}
