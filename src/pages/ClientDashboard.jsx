import './Pages.css'
import './ClientDashboard.css'
import React from 'react'
import { Link } from 'react-router-dom'
import { Sidebar } from "../components/Sidebar"

import { FaRegUser } from "react-icons/fa";

export const ClientDashboard = () => {
    return (
        <div>
            <div className="client-dashboard-container">
                <Sidebar />
                <div>
                    <div class="page-heading">
                        <div class="h2">
                            <span class="text-black">Welcome back, </span>
                            <span class="text-purple">NAME</span>
                        </div>
                    </div>

                    <div class="client-homepage-container">
                        <div class="section-quick-stats">
                            <div class="quick-stat-card">
                                    <p class="stat-heading">TODAY'S WORKOUT</p>
                                    <p class="stat">PUSH DAY</p>
                                    <p class="stat-descriptor">Chest, Shoulders, Triceps</p>
                            </div>
                            <div class="quick-stat-card">
                                    <p class="stat-heading">WEEKLY STREAK</p>
                                    <p class="stat">4 / 7</p>
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

                    </div>

                </div>
                
            </div>
        </div>
    )
}