import './Pages.css'
import './ClientDashboard.css'
import React from 'react'
import { Sidebar } from "../components/Sidebar"


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
                        <div class="main4-5">
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


                            <div class="node-28">
                                <div class="workout-plan-panel">
                                    <div class="workout-plan-heading">MY WORKOUT PLAN</div>
                                    <div class="workout-plan-list">
                                        <div class="plan-container">
                                            <div class="stat-heading">CURRENT PLAN</div>
                                            <div class="the-plan">PPL — Push Pull Legs</div>
                                        </div>
                                        <div class="plan-container">
                                            <div class="stat-heading">NEXT WORKOUT</div>
                                            <div class="the-plan">Pull Day — Tomorrow</div>
                                        </div>
                                        <div class="plan-container">
                                            <div class="stat-heading">WEEKS COMPLETED</div>
                                            <div class="the-plan">6 of 12</div>
                                        </div>

                                    </div>
                                    <div class="node-49">
                                        <div class="node-50">
                                            <p class="text-51"><span class="text-white">View Plan</span></p>
                                        </div>
                                    </div>
                                </div>
                                <div class="coach-panel-52">
                                    <div class="container-53">
                                        <div class="heading-3-54">
                                            <p class="text-55"><span class="text-black">MY COACH</span></p>
                                        </div>
                                        <div class="container-56">
                                            <div class="background-57">
                                                <p class="text-58"><span class="text-white">MR</span></p>
                                            </div>
                                            <div class="container-59">
                                                <div class="container-60">
                                                    <p class="text-61"><span class="text-black">Marcus Rivera</span></p>
                                                </div>
                                                <div class="container-62">
                                                    <p class="text-63"><span class="text-rgb-107-114-128">WORKOUT COACH ★ 4.9</span></p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="container-64">
                                            <div class="container-65">
                                                <div class="container-66">
                                                    <p class="text-67"><span class="text-rgb-107-114-128">STATUS</span></p>
                                                </div>
                                                <div class="container-68">
                                                    <p class="text-69"><span class="text-rgb-22-163-74">Active</span></p>
                                                </div>
                                            </div>
                                            <div class="container-70">
                                                <div class="container-71">
                                                    <p class="text-72"><span class="text-rgb-107-114-128">NEXT SESSION</span></p>
                                                </div>
                                                <div class="container-73">
                                                    <p class="text-74"><span class="text-black">Wed, 3:00 PM</span></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="margin-75">
                                        <div class="container-76">
                                            <div class="button-message-coach-77">
                                                <p class="text-78"><span class="text-white">Message</span></p>
                                            </div>
                                            <div class="node-79">
                                                <p class="text-80"><span class="text-black">View Profile</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>

                </div>
                
            </div>
        </div>
    )
}