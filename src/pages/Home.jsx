import "./Pages.css"
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import { LoginForm } from "../components/LoginForm"
import { TopCoaches } from "../components/TopCoaches"

import { GiBiceps } from "react-icons/gi";
import { IoIosFitness } from "react-icons/io";
import { RiUserVoiceLine } from "react-icons/ri";

export const Home = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div>
            <div className="page-heading">
                <div className="h1">
                    <span className="text-black">Welcome to </span>
                    <span className="text-purple">Primal Fitness</span>
                </div>
            </div>

            <div className="homepage-body">
                <div className="hero-section">
                    <div className="home-card hero-card">
                        <h2>FOR THE COMMITTED</h2>
                        <p className="p">Workout planning, coaching, nutrition guidance, and wellness tracking, all in one platform. Whether you're building muscle or just trying to stay fit, we're here to help you achieve your goals and unlock your full potential!</p>
                        <Link onClick={openModal} className="btn">Let's get Started!</Link>
                    </div>
                </div>

                <div className="home-container">
                    <div className="home-card">
                        <GiBiceps />
                        <h2>Exercise Library</h2>
                        <p>We provide thousands of exercises to choose from, including videos and instructions that show you how to correctly perform exercises for maximum results.</p>
                        <Link to="/exercises" className="btn">Browse All Exercises</Link>
                    </div>
                    <div className="home-card">
                        <IoIosFitness />
                        <h2>Pre-Made Workout Plans</h2>
                        <p>Our database of workout plans created by fitness experts will provide you with all the tools you need to build and maintain the body you want.</p>
                        <Link to="/workouts" className="btn">Browse Workout Plans</Link>
                    </div>
                    <div className="home-card">
                        <RiUserVoiceLine />
                        <h2>Coaches</h2>
                        <p>Connect with our wide range of speialized coaches for workout and meal planning assiatance. Match with whoever works best for you! Available 24/7 </p>
                        <Link to="/coaches" className="btn">Browse Coaches</Link>
                    </div>
                </div>
            </div>

            <TopCoaches />

            <LoginForm isOpen={isModalOpen} onClose={closeModal} />
        </div>
    )
}