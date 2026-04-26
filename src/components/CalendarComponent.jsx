import { useEffect, useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import "./CalendarPopup.css"
import "react-big-calendar/lib/css/react-big-calendar.css"
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop"
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"
import { useAuth0 } from '@auth0/auth0-react'
import { useCustomAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../utils/apiBaseUrl'

import { CalendarPopup } from './CalendarPopup'

const localizer = momentLocalizer(moment)
const DnDCalendar = withDragAndDrop(Calendar)

export const CalendarComponent = () => {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0()
    const { customAuth } = useCustomAuth()
    const [events, setEvents] = useState([])
    const [workouts, setWorkouts] = useState([])
    const [selectedDate, setSelectedDate] = useState(null)
    const [isOpenEvent, setIsOpenEvent] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState('month');

    const getToken = async () => {
        if (isAuthenticated) {
            return getAccessTokenSilently({
                authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
            })
        }

        if (customAuth) {
            return customAuth
        }

        throw new Error('Log in to view the workout calendar.')
    }

    const mapScheduledWorkout = (workout) => ({
        id: `${workout.workout_id}-${workout.scheduled_date}`,
        workoutId: workout.workout_id,
        title: workout.name,
        allDay: true,
        start: moment(workout.scheduled_date, 'YYYY-MM-DD').toDate(),
        end: moment(workout.scheduled_date, 'YYYY-MM-DD').add(1, 'day').toDate(),
        scheduledDate: workout.scheduled_date,
        status: workout.status,
    })

    const loadCalendarData = async () => {
        try {
            const token = await getToken()
            const [scheduledResponse, workoutsResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/workouts/scheduled`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_BASE_URL}/workouts`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ])

            if (!scheduledResponse.ok) {
                throw new Error(`Failed to load scheduled workouts (${scheduledResponse.status})`)
            }
            if (!workoutsResponse.ok) {
                throw new Error(`Failed to load workouts (${workoutsResponse.status})`)
            }

            const scheduledData = await scheduledResponse.json()
            const workoutData = await workoutsResponse.json()
            setEvents(scheduledData.map(mapScheduledWorkout))
            setWorkouts(workoutData)
        } catch (err) {
            setError(err.message || 'Unable to load calendar data.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCalendarData()
    }, [customAuth, getAccessTokenSilently, isAuthenticated])

    const handleSelectEvent = (event) => {
        setSelectedDate(null)
        setSelectedEvent(event)
        setIsOpenEvent(true)
    }

    const handleSelectSlot = (slotInfo) => {
        setSelectedDate(slotInfo.start)
        setSelectedEvent(null)
        setIsOpenEvent(true)
    }

    const handleSave = async ({ workoutId, scheduledDate }) => {
        try {
            setSubmitting(true)
            const token = await getToken()

            if (selectedEvent) {
                await fetch(
                    `${API_BASE_URL}/workouts/${selectedEvent.workoutId}/schedule/${selectedEvent.scheduledDate}`,
                    {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` },
                    }
                )
            }

            const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}/schedule`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ scheduled_date: scheduledDate }),
            })

            if (!response.ok) {
                const responseBody = await response.json().catch(() => ({}))
                throw new Error(responseBody.detail || `Failed to save calendar workout (${response.status})`)
            }

            await loadCalendarData()
            setSelectedEvent(null)
            setIsOpenEvent(false)
            setSelectedDate(null)
        } catch (err) {
            setError(err.message || 'Unable to save calendar workout.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (event) => {
        try {
            setSubmitting(true)
            const token = await getToken()
            const response = await fetch(
                `${API_BASE_URL}/workouts/${event.workoutId}/schedule/${event.scheduledDate}`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                }
            )

            if (!response.ok && response.status !== 204) {
                const responseBody = await response.json().catch(() => ({}))
                throw new Error(responseBody.detail || `Failed to delete scheduled workout (${response.status})`)
            }

            await loadCalendarData()
            setSelectedEvent(null)
            setIsOpenEvent(false)
            setSelectedDate(null)
        } catch (err) {
            setError(err.message || 'Unable to delete scheduled workout.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleEventDrop = async ({ start, event }) => {
        try {
            const newDate = moment(start).format('YYYY-MM-DD')
            if (newDate === event.scheduledDate) {
                return
            }

            setSubmitting(true)
            const token = await getToken()

            await fetch(`${API_BASE_URL}/workouts/${event.workoutId}/schedule/${event.scheduledDate}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })

            const response = await fetch(`${API_BASE_URL}/workouts/${event.workoutId}/schedule`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ scheduled_date: newDate }),
            })

            if (!response.ok) {
                const responseBody = await response.json().catch(() => ({}))
                throw new Error(responseBody.detail || `Failed to move scheduled workout (${response.status})`)
            }

            await loadCalendarData()
        } catch (err) {
            setError(err.message || 'Unable to move scheduled workout.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <div className="calendar-shell">
            {loading && <p className="calendar-feedback">Loading calendar...</p>}
            {error && <p className="calendar-feedback" style={{ color: '#b91c1c' }}>Error: {error}</p>}
            <div>
                <DnDCalendar
                    selectable
                    localizer={localizer}
                    events={events}
                    date={currentDate}
                    view={currentView }
                    onNavigate={(date) => setCurrentDate(date)}
                    onView={(view) => setCurrentView(view)}
                    startAccessor="start"
                    endAccessor="end"
                    defaultView="month"
                    views={['month', 'week']}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    onEventDrop={handleEventDrop}
                    style={{ height: "77vh" }}
                    resizable={false}
                    eventPropGetter={() => {
                        const backgroundColor = '#8B8BF5';
                        return { style: { backgroundColor } };
                    }}
                />
            </div>
            </div>

            {isOpenEvent && (
                <CalendarPopup
                    isOpen={isOpenEvent}
                    onClose={() => setIsOpenEvent(false)}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    date={selectedDate}
                    event={selectedEvent}
                    workouts={workouts}
                    submitting={submitting}
                />
            )}
        </>
    )
}
