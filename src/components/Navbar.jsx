import "./Navbar.css"
import React from 'react'
import { Link, NavLink } from 'react-router-dom' 
import { IoFitness } from "react-icons/io5";

export const Navbar = () => {
    return (
        <nav>
                
            <Link to="/" className="title">
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
                    <NavLink to="/login">Log In</NavLink>
                </li>
            </ul>
        </nav>
    )
}