import './CalendarPopup.css'
import React, { useEffect, useState } from "react"
import moment from 'moment'

export const CalendarPopup = ({ isOpen, onClose, onSave, date, event }) => {
    const [workout, setWorkout] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');

    useEffect(() => {
        console.log('Event popup', event)
        if (event) {
            setWorkout(event.workout);
            setStart(moment(event.start).format('YYYY-MM-DD'));
            setEnd(moment(event.end).subtract(1, 'day').format('YYYY-MM-DD'));
        }
        else if (date) {
            const defaultStart = new Date(date);
            const defaultEnd = new Date(date);
            setStart(moment(defaultStart).format('YYYY-MM-DD'));
            setEnd(moment(defaultEnd).format('YYYY-MM-DD'));
        }
    }, [event, date])

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log(e)

        const startDate = moment(start).startOf('day').toDate()
        const endDate = moment(end).add(1, 'day').startOf('day').toDate()

        onSave({
            id: event?.id,
            title: workout,
            allDay: true,
            start: startDate,
            end: endDate
        })
    }


    return (
        <div className="calendar-popup-background">
            <div className="calendar-popup-container">
                <div className="h3">{event ? "Edit workout" : "Add Workout"}</div>

                <form onSubmit={handleSubmit}>
                    
                    <div className="calendar-popup-contents">
                        <label className="calendar-form-label" >Workout: </label>

                        {/* here would be a list of the client's saved workouts */}
                        <select className="calendar-form-input" required value={workout} onChange={(e) => setWorkout(e.target.value)}>
                            <option value={workout}>{workout}</option>
                            <option value="Workout 1">Workout 1</option>
                            <option value="Workout 2">Workout 2</option>
                            <option value="Workout 3">Workout 3</option>
                        </select>
                    </div>

                    <div className="calendar-popup-contents">
                        <label className="calendar-form-label">Start Date:</label>
                        <input className="calendar-form-input" type="date" required value={start} onChange={(e) => setStart(e.target.value)} />
                    </div>
                    <div className="calendar-popup-contents">
                        <label className="calendar-form-label">End Date:</label>
                        <input className="calendar-form-input" type="date" required value={end} onChange={(e) => setEnd(e.target.value)} />
                    </div>

                    <button className="calendar-btn" type="submit" >Save</button>
                    <button className="calendar-btn-outline" type="button" onClick={onClose}>Cancel</button>

                    {event && (
                        <button className="calendar-btn-delete" type="button" onClick={onClose}>Delete</button>
                    )}
                </form>
            </div>
        </div>
    )
}