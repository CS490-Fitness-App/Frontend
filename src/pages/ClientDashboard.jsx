import React, { useEffect, useState } from 'react'
import { Sidebar } from "../components/Sidebar"
import './Pages.css'
import './ClientDashboard.css'

export const ClientDashboard = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        fetch("http://127.0.0.1:8000/dashboard/client")
            .then(res => res.json())
            .then(data => {
                setData(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setError("Unable to load dashboard data.")
                setLoading(false)
            })
    }, [])

    return (
        <div className="client-dashboard-page">
            <div className="page-heading">
                <div className="h2">
                    <span className="text-black">Welcome back, </span>
                    <span className="text-purple">
                        {loading ? "Loading..." : data?.name || "Client"}
                    </span>
                </div>
            </div>

            <div className="client-dashboard-layout">
                <Sidebar />

                <div className="client-dashboard-content">
                    <div className="client-dashboard-card">
                        <h3>Today's Workout</h3>
                        <p>
                            {loading
                                ? "Loading..."
                                : error || data?.today_workout || "No workout available."}
                        </p>
                    </div>

                    <div className="client-dashboard-card">
                        <h3>Recent Activity</h3>
                        <p>
                            {loading
                                ? "Loading..."
                                : error || data?.recent_activity || "No recent activity."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
