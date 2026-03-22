import "./Navbar.css"
import React from 'react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom' 
import { IoFitness } from "react-icons/io5";

import { LoginForm } from "./LoginForm"

export const Navbar = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div>
            <nav>          
                <Link to="/" className="nav-logo">
                    <svg viewBox="0 0 32 32" fill="none">
                        <circle cx="10" cy="16" r="7" fill="black" />
                        <circle cx="22" cy="16" r="7" fill="black" />
                        <circle cx="16" cy="16" r="5" fill="black" />
                        <rect x="6" y="14" width="20" height="4" rx="2" fill="black" />
                    </svg>
                    <span>PrimalTraining</span>
                </Link>
                <ul>
                    <li>
                        <NavLink to="/exercises">Exercises</NavLink>
                    </li>
                    <li>
                        <NavLink to="/workouts">Workouts</NavLink>
                    </li>
                    <li>
                        <NavLink to="/survey">Survey</NavLink>
                    </li>
                    <li>
                        <NavLink to="/workouts" onClick={openModal}>Log In</NavLink>
                    </li>
                </ul>
            </nav>
            <LoginForm isOpen={isModalOpen} onClose={closeModal} />
        </div>

    )
}