import React from 'react'
import { Link } from 'react-router-dom'

export const Navbar = () => {
    return (
        <nav>
            <Link to="/">Primal Fitness</Link>
            <ul>
                <li>
                    <Link to="/exercises">Exercises</Link>
                </li>
                <li>
                    <Link to="/workouts">Workouts</Link>
                </li>
                <li>
                    <Link to="/login">Log In</Link>
                </li>
            </ul>
        </nav>
    );
};