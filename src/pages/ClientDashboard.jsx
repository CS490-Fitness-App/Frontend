import React from 'react'
import { Sidebar } from "../components/Sidebar"
import './Pages.css'

export const ClientDashboard = () => {
    return (
        <div>
            <div class="page-heading">
                <div class="h2">
                    <span class="text-black">Welcome back, </span>
                    <span class="text-purple">NAME</span>
                </div>
            </div>
            <Sidebar />
        </div>
    )
}