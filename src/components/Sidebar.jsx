import "./Sidebar.css"
import React from 'react'
import { Link, NavLink } from 'react-router-dom'

//import { MdOutlineCancel } from "react-icons/md";

const links = [
    { name: 'Dashboard', path: '/client-dashboard' },
    { name: 'User Profile', path: '/user-profile' },
    { name: 'My Workout Plans', path: '/workouts' },
    { name: 'Calendar', path: '/calendar' },
    { name: 'Activity Logger', path: '/' },
    { name: 'View Progress', path: '/' },
    { name: 'Coach Chat', path: '/' },
    { name: 'Payment Methods', path: '/payment-cards' },
];

export const Sidebar = () => {
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
