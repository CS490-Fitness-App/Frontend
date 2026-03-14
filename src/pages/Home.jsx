import "./Pages.css"
import React from 'react'

export const Home = () => {
    return (
        <div>
            <div class="page-heading">
                <div class="h1">
                    <span class="text-black">Welcome to </span>
                    <span class="text-purple">Primal Fitness</span>
                </div>
            </div>

            <div class="homepage-body">
                <div class="home-container">
                    <img src="https://picsum.photos/600/371" alt="image" />
                    <div class="home-card">
                        <h2>FOR THE COMMITTED</h2>
                        <p>Train like an athlete with top-tier equipment and expert programming. Whether you're building muscle or breaking PRs, we help you push past limits.</p>
                    </div>
                </div>
                <div class="home-container">
                    <div class="home-card">
                        <h2>Browse Exercises</h2>
                        <p>We believe in creating a positive environment where you can thrive. We're here to help you achieve your goals and unlock your full potential.</p>
                    </div>
                    <div class="home-card">
                        <h2>Browse Pre-Made Workout Plans</h2>
                        <p>Our facility is the optimal environment for strength training and performance, fully equipped with top-of-the-line tools, ample training areas, and a focus on functional movement.</p>
                    </div>
                    <div class="home-card">
                        <h2>Browse Coaches</h2>
                        <p>Our facility is the optimal environment for strength training and performance, fully equipped with top-of-the-line tools, ample training areas, and a focus on functional movement.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}