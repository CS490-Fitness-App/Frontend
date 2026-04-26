import React from "react"
import './Pages.css'
import './ClientDashboard.css'

import { Sidebar } from "../components/Sidebar"
import { CalendarComponent } from '../components/CalendarComponent'

export const ClientCalendar = () => {
    return (
        <div>
            <div className="dashboard-container">

                <Sidebar />

                <div>
                    <div className="page-heading">
                        <div className="h2">
                            <span className="text-black">My Workout </span>
                            <span className="text-purple">Calendar</span>
                        </div>

                    </div>

                    <div className="calendar-container">
                        <CalendarComponent />
                    </div>
                </div>
            </div>
        </div>
    )
}