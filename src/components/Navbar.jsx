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
                <Link to="/" className="logo">
                    <IoFitness/>  Primal Fitness
                </Link>
                <ul>
                    <li>
                        <NavLink to="/exercises">Exercises</NavLink>
                    </li>
                    <li>
                        <NavLink to="/workouts">Workouts</NavLink>
                    </li>
                    <li>
                        <NavLink to="/" onClick={openModal}>Log In</NavLink>
                    </li>
                </ul>
            </nav>
            <LoginForm isOpen={isModalOpen} onClose={closeModal} />
        </div>

    )
}