import React, { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'
import { FaRegUser, FaChartPie } from "react-icons/fa"
import { BsBarChartFill } from "react-icons/bs"
import { FaClipboardCheck } from "react-icons/fa6"

import { useCustomAuth } from '../context/AuthContext'
import { Sidebar } from "../components/Sidebar"
import './Pages.css'
import './ClientDashboard.css'
import { API_BASE_URL } from '../utils/apiBaseUrl'

export const ClientDashboard = () => {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0()
    const { customAuth } = useCustomAuth()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const displayFirstName = data?.full_name?.split(' ')[0] || data?.name?.split(' ')[0] || ''

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                let token
                if (isAuthenticated) {
                    token = await getAccessTokenSilently({
                        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
                    })
                } else if (customAuth) {
                    token = customAuth
                } else {
                    setLoading(false)
                    return
                }

                const res = await fetch(`${API_BASE_URL}/dashboard/client`, {
                    headers: { Authorization: `Bearer ${token}` },
                })

                if (!res.ok) {
                    throw new Error("Unable to load dashboard data.")
                }

                const dashboardData = await res.json()
                setData(dashboardData)
                setError("")
            } catch (err) {
                console.error('Failed to load dashboard:', err)
                setError("Unable to load dashboard data.")
            } finally {
                setLoading(false)
            }
        }

        fetchDashboard()
    }, [isAuthenticated, customAuth, getAccessTokenSilently])

    const formatWeight = (weight) => {
        if (weight === null || weight === undefined) return "Not set"
        return `${weight} LB`
    }

    const progressText = data?.intended_duration_weeks
        ? `${data?.weeks_completed || 0} of ${data.intended_duration_weeks}`
        : `${data?.weeks_completed || 0} completed`

    return (
        <div>
            <div className="dashboard-container">
                <Sidebar />
                <div>
                    <div className="page-heading">
                      <div className="h2">
                        <span className="text-black">Welcome back, </span>
                          <span className="text-purple">
                                                        {loading ? "Loading..." : displayFirstName}
                          </span>
                        </div>
                      </div>


                    <div className="dashboard-homepage-container">
                        {error && <p className="stat-descriptor">{error}</p>}

                        <div className="section-quick-stats">
                            <div className="quick-stat-card">
                                <p className="stat-heading">TODAY'S WORKOUT</p>
                                <p className="stat">
                                    {loading ? "Loading..." : data?.today_workout || "No workout available."}
                                </p>
                                <p className="stat-descriptor">
                                    {loading ? "Loading..." : data?.today_descriptor || "Nothing scheduled for today"}
                                </p>
                            </div>
                            <div className="quick-stat-card">
                                <p className="stat-heading">WEEKLY STREAK</p>
                                <p className="stat">
                                    {loading ? "Loading..." : `${data?.weekly_streak ?? 0} / 7`}
                                </p>
                                <p className="stat-descriptor">
                                    {loading ? "Loading..." : data?.streak_descriptor || "No recent activity."}
                                </p>
                            </div>
                            <div className="quick-stat-card">
                                <p className="stat-heading">CURRENT WEIGHT</p>
                                <p className="stat">{loading ? "Loading..." : formatWeight(data?.current_weight_lb)}</p>
                                <p className="stat-descriptor">
                                    {loading ? "Loading..." : data?.weight_descriptor || "No goal weight set"}
                                </p>
                            </div>
                        </div>

                        <div className="section-2">
                            <div className="workout-plan-panel">
                                <div className="dashboard-heading">MY WORKOUT PLAN</div>
                                <div className="dashboard-list-container">
                                    <div className="dashboard-list-contents">
                                        <div className="stat-heading">CURRENT PLAN</div>
                                        <div className="dashboard-list">
                                            {loading ? "Loading..." : data?.current_plan_name || "No active workout plan"}
                                        </div>
                                    </div>
                                    <div className="dashboard-list-contents">
                                        <div className="stat-heading">NEXT WORKOUT</div>
                                        <div className="dashboard-list">
                                            {loading ? "Loading..." : data?.next_workout_name || "No upcoming workout"}
                                        </div>
                                    </div>
                                    <div className="dashboard-list-contents">
                                        <div className="stat-heading">SCHEDULE</div>
                                        <div className="dashboard-list">
                                            {loading ? "Loading..." : data?.next_workout_date || "No workout scheduled"}
                                        </div>
                                    </div>
                                    <div className="dashboard-list-contents">
                                        <div className="stat-heading">WEEKS COMPLETED</div>
                                        <div className="dashboard-list">
                                            {loading ? "Loading..." : progressText}
                                        </div>
                                    </div>
                                </div>
                                <div className="btn-container">
                                    <Link to="/workouts" className="panel-btn-purple">View Plan</Link>
                                </div>
                            </div>
                            <div className="coach-panel">
                                <div className="dashboard-heading">MY COACH</div>
                                <div className="coach-container">
                                    <div className="profile-bg">
                                        <FaRegUser />
                                    </div>
                                    <div className="container-59">
                                        <div className="dashboard-list">
                                            {loading ? "Loading..." : data?.coach_name || "No coach assigned"}
                                        </div>
                                        <div className="stat-heading">WORKOUT COACH</div>
                                    </div>
                                </div>
                                <div className="dashboard-list-container">
                                    <div className="dashboard-list-contents">
                                        <div className="stat-heading">STATUS</div>
                                        <div className="dashboard-list">
                                            {loading ? "Loading..." : data?.coach_status || "No active coach"}
                                        </div>
                                    </div>
                                    <div className="dashboard-list-contents">
                                        <div className="stat-heading">RECENT ACTIVITY</div>
                                        <div className="dashboard-list">
                                            {loading ? "Loading..." : data?.recent_activity || "No recent activity."}
                                        </div>
                                    </div>
                                </div>
                                <div className="btn-container">
                                    <Link className="panel-btn-purple">Message</Link>
                                    <Link className="panel-btn-white">View Profile</Link>
                                </div>
                            </div>
                        </div>

                        <div className="section-2">
                            <div className="workout-plan-panel">
                                <div className="container-others">
                                    <div className="icon-bg">
                                        <BsBarChartFill />
                                    </div>
                                    <div className="header-others">LOG ACTIVITY</div>
                                    <div className="stat-descriptor">Record your sets, reps, weights, and cardio for today&apos;s workout.</div>
                                </div>
                                <div className="btn-container">
                                    <Link className="panel-btn-purple">Log Now</Link>
                                </div>
                            </div>
                            <div className="workout-plan-panel">
                                <div className="container-others">
                                    <div className="icon-bg">
                                        <FaClipboardCheck />
                                    </div>
                                    <div className="header-others">DAILY CHECK-IN</div>
                                    <div className="stat-descriptor">Log your calories, steps, water intake, weight, and mood for today.</div>
                                </div>
                                <div className="btn-container">
                                    <Link className="panel-btn-purple">Check In</Link>
                                </div>
                            </div>
                            <div className="workout-plan-panel">
                                <div className="container-others">
                                    <div className="icon-bg">
                                        <FaChartPie />
                                    </div>
                                    <div className="header-others">VIEW PROGRESS</div>
                                    <div className="stat-descriptor">See your charts and trends over the past weeks and months.</div>
                                </div>
                                <div className="btn-container">
                                    <Link className="panel-btn-purple">View Charts</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
