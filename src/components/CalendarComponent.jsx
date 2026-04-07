import { useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import "./CalendarPopup.css"
import "react-big-calendar/lib/css/react-big-calendar.css"
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop"
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"

import { CalendarPopup } from './CalendarPopup'

const localizer = momentLocalizer(moment)
const DnDCalendar = withDragAndDrop(Calendar)

const testWorkouts = [
    {
        id: 1,
        title: 'Workout 1',
        allDay: true,
        start: new Date(2026, 3, 2),
        end: new Date(2026, 3, 3)
    },
    {
        id: 2,
        title: 'Workout 2',
        allDay: true,
        start: new Date(2026, 3, 5),
        end: new Date(2026, 3, 5)
    },
    {
        id: 3,
        title: 'Workout 3',
        allDay: true,
        start: new Date(2026, 3, 6),
        end: new Date(2026, 3, 6)
    },
];

export const CalendarComponent = () => {
    const [events, setEvents] = useState(testWorkouts)
    const [selectedDate, setSelectedDate] = useState(null)
    const [isOpenEvent, setIsOpenEvent] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState(null)
    

    const handleSelectEvent = (event) => {
        console.log(event)
        setSelectedDate(null)
        setSelectedEvent(event)
        setIsOpenEvent(true)
    }

    const handleSelectSlot = (slotInfo) => {
        console.log(slotInfo)
        setSelectedDate(slotInfo.start)
        setSelectedEvent(null)
        setIsOpenEvent(true)
    }

    const handleSave = (eventData) => {
        if (eventData.id) {
            setEvents((prev) =>
                prev.map((ev) => (ev.id === eventData.id ? eventData : ev))
            )
        } else {
            const newEvent = {
                ...eventData,
                id: events.length + 1
            };
            setEvents((prev) => [...prev, newEvent])
        }
        setSelectedEvent(null)
        setIsOpenEvent(false)
        setSelectedDate(null)
    }

    const handleEventDrop = ({ start, event, end }) => {
        console.log('handleEventDrop ', start, ' ', event, ' ', end)
        const updatedEvent = { ...event, start, end }

        setEvents((prev) =>
            prev.map((ev) => (ev.id === event.id ? updatedEvent : ev))
        )
    }

    return (
        <>
            <div style={{ margin: "50px"} }>
                <DnDCalendar
                    selectable
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    defaultView="month"
                    views={['month', 'week']}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    onEventDrop={handleEventDrop}
                    style={{ height: "77vh" }}
                    eventPropGetter={() => {
                        const backgroundColor = '#8B8BF5';
                        return { style: { backgroundColor } };
                    }}
                />
            </div>

            {isOpenEvent && (
                <CalendarPopup
                    isOpen={isOpenEvent}
                    onClose={() => setIsOpenEvent(false)}
                    onSave={handleSave}
                    date={selectedDate}
                    event={selectedEvent}
                />
            )}
        </>
    )
}