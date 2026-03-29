import './Pages.css'
import './ClientDashboard.css'
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sidebar } from "../components/Sidebar"

import { FaRegUser, FaChartPie } from "react-icons/fa";
import { BsBarChartFill } from "react-icons/bs";
import { FaClipboardCheck } from "react-icons/fa6";

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
        <div>
            <div className="client-dashboard-container">
                <Sidebar />
                <div>
                    <div class="page-heading">
                        <div class="h2">
                            <span class="text-black">Welcome back, </span>
                            <span class="text-purple">
                                {loading ? "Loading..." : data?.name || "Client"}
                            </span>
                        </div>
                    </div>

                    <div class="client-homepage-container">
                        <div class="section-quick-stats">
                            <div class="quick-stat-card">
                                <p class="stat-heading">TODAY'S WORKOUT</p>
                                <p class="stat">
                                    {loading ? "Loading..." : data?.today_workout || "No workout available."}
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
                                    <p class="stat">172 LB</p>
                                <p class="stat-descriptor">Goal: 165 lb - 3 lb this month</p>
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
                                    <div class="coach-container">
                                        <div class="profile-bg">
                                            <FaRegUser/>
                                        </div>
                                        <div class="container-59">
                                            <div class="dashboard-list">Marcus Rivera</div>
                                            <div class="stat-heading">WORKOUT COACH ★ 4.9</div>
                                        </div>
                                    </div>
                                    <div class="dashboard-list-container">
                                        <div class="dashboard-list-contents">
                                            <div class="stat-heading">STATUS</div>
                                            <div class="dashboard-list">Active</div>
                                        </div>
                                        <div class="dashboard-list-contents">
                                            <div class="stat-heading">NEXT SESSION</div>
                                            <div class="dashboard-list">Wed, 3:00 PM</div>
                                        </div>
                                    </div>
                                <div className="btn-container">
                                    <Link className="panel-btn-purple">Message</Link>
                                    <Link className="panel-btn-white">View Profile</Link>
                                </div>
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
