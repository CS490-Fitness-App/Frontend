import React from "react"
import './Pages.css'
import './ClientDashboard.css'

import { CalendarComponent } from '../components/CalendarComponent'

export const ClientCalendar = () => {
    return (
        <div>
            <div className="dashboard-page-heading" width="85vw">
                <div className="h2">
                    <span className="text-black">My Workout </span>
                    <span className="text-purple">Calendar</span>
                </div>
            </div>

            <CalendarComponent />
        </div>
    )
}