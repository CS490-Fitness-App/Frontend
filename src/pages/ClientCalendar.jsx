import React from "react"
import { useSearchParams } from "react-router-dom"
import './Pages.css'
import './ClientDashboard.css'

import { Sidebar } from "../components/Sidebar"
import { CalendarComponent } from '../components/CalendarComponent'

export const ClientCalendar = () => {
    const [searchParams] = useSearchParams()
    const preselectedWorkoutId = searchParams.get('workout_id') ? Number(searchParams.get('workout_id')) : null
    const clientId = searchParams.get('client_id') ? Number(searchParams.get('client_id')) : null
    const clientName = searchParams.get('client_name') ? decodeURIComponent(searchParams.get('client_name')) : null

    return (
        <div>
            <div className="dashboard-container">
                <Sidebar />
                <div>
                    <div className="page-heading">
                        <div className="h2">
                            {clientName ? (
                                <>
                                    <span className="text-black">Schedule for </span>
                                    <span className="text-purple">{clientName}</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-black">My Workout </span>
                                    <span className="text-purple">Calendar</span>
                                </>
                            )}
                        </div>

                    </div>

                    <div className="calendar-container">
                        <CalendarComponent
                            preselectedWorkoutId={preselectedWorkoutId}
                            clientId={clientId}
                            clientName={clientName}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}