import "./Sidebar.css"
import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCustomAuth } from '../context/AuthContext'

//import { MdOutlineCancel } from "react-icons/md";

const links = [
    { name: 'Client Dashboard', path: '/client-dashboard', allowedRoles: ['client', 'coach'] },
    { name: 'Coach Dashboard', path: '/coach-dashboard', allowedRoles: ['coach'] },
    { name: 'Admin Panel', path: '/dashboard/admin', allowedRoles: ['admin'] },
    { name: 'User Profile', path: '/profile', allowedRoles: ['client', 'coach', 'admin'] },
    { name: 'My Workout Plans', path: '/my-workouts', allowedRoles: ['client', 'coach'] },
    { name: 'Calendar', path: '/calendar', allowedRoles: ['client', 'coach'] },
    { name: 'Activity Logger', path: '/activity-logger', allowedRoles: ['client'] },
    { name: 'View Progress', path: '/view-progress', allowedRoles: ['client', 'coach'] },
    { name: 'Chat', path: '/chat', allowedRoles: ['client', 'coach'] },
    { name: 'Payment Methods', path: '/payment-cards', allowedRoles: ['client', 'coach'] },
    { name: 'My Clients', path: '/', allowedRoles: ['coach'] } 
];

export const Sidebar = () => {
    const { userRole } = useCustomAuth()

    const filteredItems = links.filter(item =>
        !item.allowedRoles || item.allowedRoles.includes(userRole)
    );

    return (
        <div className="sidebar-container">
            <nav className="sidebar-nav">
                {filteredItems.map((link) => (
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
