import React, { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useCustomAuth } from '../context/AuthContext'
import './Pages.css'
import './ClientDashboard.css'
import { Link } from 'react-router-dom'
import { Sidebar } from "../components/Sidebar"

import { FaRegUser, FaChartPie } from "react-icons/fa";
import { BsBarChartFill } from "react-icons/bs";
import { FaClipboardCheck } from "react-icons/fa6";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export const ClientDashboard = () => {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0()
    const { customAuth } = useCustomAuth()
    const [name, setName] = useState('')
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

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
                if (res.ok) {
                    const json = await res.json()
                    setData(json)
                    setName(json.name || '')
                }
            } catch (err) {
                console.error('Failed to load dashboard:', err)
                setError('Unable to load dashboard data.')
            } finally {
                setLoading(false)
            }
        }
        fetchDashboard()
    }, [isAuthenticated, customAuth, getAccessTokenSilently])

    return (
        <div>
            <div className="dashboard-container">
                <Sidebar />
                <div>
                    <div class="page-heading">
                        <div class="h2">
                            <span class="text-black">Welcome back, </span>
                            <span class="text-purple">
                                {loading ? "Loading..." : name || "Client"}
                            </span>
                        </div>
                    </div>

                    <div class="dashboard-homepage-container">
                        <div class="section-quick-stats">
                            <div class="quick-stat-card">
                                <p class="stat-heading">TODAY'S WORKOUT</p>
                                <p class="stat">
                                    {loading ? "Loading..." : (data?.today_workouts?.[0] || "No workout scheduled.")}
                                </p>
                                <p class="stat-descriptor">Chest, Shoulders, Triceps</p>
                            </div>
                            <div class="quick-stat-card">
                                    <p class="stat-heading">WEEKLY STREAK</p>
                                <p class="stat">
                                    {loading ? "Loading..." : data?.recent_activity || "0 / 7"}
                                </p>
                                <p class="stat-descriptor">Keep it up! 3 days left</p>
                            </div>
                            <div class="quick-stat-card">
                                    <p class="stat-heading">CURRENT WEIGHT</p>
                                    <p class="stat">
                                        {loading ? "Loading..." : data?.weight_lbs != null ? `${data.weight_lbs} LB` : "—"}
                                    </p>
                                <p class="stat-descriptor">
                                    {data?.goal_weight_lbs != null ? `Goal: ${data.goal_weight_lbs} lb` : "No goal set"}
                                </p>
                            </div>
                        </div>

                        <div class="section-2">
                            <div class="workout-plan-panel">
                                <div class="dashboard-heading">MY WORKOUT PLAN</div>
                                <div class="dashboard-list-container">
                                    <div class="dashboard-list-contents">
                                        <div class="stat-heading">CURRENT PLAN</div>
                                        <div class="dashboard-list">PPL — Push Pull Legs</div>
                                    </div>
                                    <div class="dashboard-list-contents">
                                        <div class="stat-heading">NEXT WORKOUT</div>
                                        <div class="dashboard-list">Pull Day — Tomorrow</div>
                                    </div>
                                    <div class="dashboard-list-contents">
                                        <div class="stat-heading">WEEKS COMPLETED</div>
                                        <div class="dashboard-list">6 of 12</div>
                                    </div>

                                </div>
                                <div className="btn-container">
                                    <Link className="panel-btn-purple">View Plan</Link>
                                </div>
                            </div>
                            <div class="coach-panel">
                                <div class="dashboard-heading">MY COACH</div>
                                {data?.active_coach ? (
                                    <>
                                        <div class="coach-container">
                                            <div class="profile-bg">
                                                <FaRegUser/>
                                            </div>
                                            <div class="container-59">
                                                <div class="dashboard-list">
                                                    {data.active_coach.first_name} {data.active_coach.last_name}
                                                </div>
                                                <div class="stat-heading">
                                                    {data.active_coach.specialization.toUpperCase()}
                                                    {data.active_coach.avg_rating != null && ` ★ ${data.active_coach.avg_rating}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="dashboard-list-container">
                                            <div class="dashboard-list-contents">
                                                <div class="stat-heading">STATUS</div>
                                                <div class="dashboard-list">{data.active_coach.status}</div>
                                            </div>
                                        </div>
                                        <div className="btn-container">
                                            <Link className="panel-btn-purple">Message</Link>
                                            <Link className="panel-btn-white">View Profile</Link>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ color: '#888', fontSize: '0.9rem', padding: '1rem 0' }}>
                                        {loading ? 'Loading...' : 'No active coach. Browse coaches to get started.'}
                                    </div>
                                )}
                            </div>
                        </div>


                        <div class="section-2">
                            <div class="workout-plan-panel">
                                <div class="container-others">
                                    <div class="icon-bg">
                                        <BsBarChartFill />
                                    </div>
                                    <div class="header-others">LOG ACTIVITY</div>
                                    <div class="stat-descriptor">Record your sets, reps, weights, and cardio for today's workout.</div>
                                </div>
                                <div className="btn-container">
                                    <Link className="panel-btn-purple">Log Now</Link>
                                </div>
                            </div>
                            <div class="workout-plan-panel">
                                <div class="container-others">
                                    <div class="icon-bg">
                                        <FaClipboardCheck />
                                    </div>
                                    <div class="header-others">DAILY CHECK-IN</div>
                                    <div class="stat-descriptor">Log your calories, steps, water intake, weight, and mood for today.</div>
                                </div>
                                <div className="btn-container">
                                    <Link className="panel-btn-purple">Check In</Link>
                                </div>
                            </div>
                            <div class="workout-plan-panel">
                                <div class="container-others">
                                    <div class="icon-bg">
                                        <FaChartPie />
                                    </div>
                                    <div class="header-others">VIEW PROGRESS</div>
                                    <div class="stat-descriptor">See your charts and trends over the past weeks and months.</div>
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
