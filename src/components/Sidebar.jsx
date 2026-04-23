import "./Sidebar.css"
import React from 'react'
import { NavLink } from 'react-router-dom'
import { useCustomAuth } from '../context/AuthContext'

//import { MdOutlineCancel } from "react-icons/md";

const roleLinks = {
  client: [
    { name: 'Dashboard', path: '/client-dashboard' },
    { name: 'User Profile', path: '/' },
    { name: 'My Workout Plans', path: '/workouts' },
    { name: 'Calendar', path: '/calendar' },
    { name: 'Activity Logger', path: '/' },
    { name: 'View Progress', path: '/' },
    { name: 'Coach Chat', path: '/chat' },
    { name: 'Payment Methods', path: '/payment-cards' },
  ],
  coach: [
    { name: 'Dashboard', path: '/coach-dashboard' },
    { name: 'My Clients', path: '/coach-dashboard' },
    { name: 'Workouts', path: '/workouts' },
    { name: 'Coach Chat', path: '/chat' },
  ],
  admin: [
    { name: 'Dashboard', path: '/admin-dashboard' },
    { name: 'Coach Management', path: '/admin-dashboard' },
    { name: 'Exercise Inventory', path: '/admin-dashboard' },
  ],
}

export const Sidebar = () => {
    const { currentUser } = useCustomAuth()
    const links = roleLinks[currentUser?.role] || roleLinks.client

    return (
        <div className="sidebar-container">
            <nav className="sidebar-nav">
                {links.map((link) => (
                    <NavLink
                        key={link.name}
                        to={link.path}
                        className={({ isActive }) =>
                            isActive ? "sidebar-link active" : "sidebar-link"
                        }
                    >
                        {link.name}
                    </NavLink>
                ))}
            </nav>
        </div>
    )
}
