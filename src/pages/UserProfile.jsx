import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Pages.css'
import './UserProfile.css'

export const UserProfile = () => {
	return (
        <div>
            <div className="page-heading">
                <div className="h2">
                <span className="text-black">My </span>
                    <span className="text-purple">Profile</span>
                </div>
            </div>

            <div className="user-profile-contents">
                <div className="user-header">
                    <div className="user-temp-pfp">AJ</div>
                    <div className="user-content">
                        <div className="user-name">Alex Johnson</div>
                        <div className="user-type">Client</div>
                    </div>
                </div>

                <div className="user-info-box">
                    <div className="profile-heading">Personal Information</div>

                    <div className="personal-info-grid">
                        <div>
                            <div className="personal-info-heading">Email</div>
                            <div className="personal-info">alxjohnson@gmail.com</div>
                        </div>
                        <div>
                            <div className="personal-info-heading">Height</div>
                            <div className="personal-info">5' 10"</div>
                        </div>
                        <div>
                            <div className="personal-info-heading">Currrent Weight</div>
                            <div className="personal-info">172 lb</div>
                        </div>
                        <div>
                            <div className="personal-info-heading">Goal Weight</div>
                            <div className="personal-info">165 lb</div>
                        </div>
                        <div>
                            <div className="personal-info-heading">Fitness Goal</div>
                            <div className="personal-info">Build muscle</div>
                        </div>
                        <div>
                            <div className="personal-info-heading">Experience Level</div>
                            <div className="personal-info">Intermediate</div>
                        </div>
                    </div>
                </div>

                <div className="coach-info-box">
                    <div className="profile-heading">Coach Details</div>

                    <div className="personal-info-grid">
                        <div>
                            <div className="personal-info-heading">Specialization</div>
                            <div className="personal-info">alxjohnson@gmail.com</div>
                        </div>
                        <div>
                            <div className="personal-info-heading">Hourly Rate</div>
                            <div className="personal-info">5' 10"</div>
                        </div>
                        <div>
                            <div className="personal-info-heading">Certificatoins</div>
                            <div className="personal-info">172 lb</div>
                        </div>
                        <div>
                            <div className="personal-info-heading">Years of Experience</div>
                            <div className="personal-info">165 lb</div>
                        </div>
                        <div>
                            <div className="personal-info-heading">Active Clients</div>
                            <div className="personal-info">Build muscle</div>
                        </div>
                        <div>
                            <div className="personal-info-heading">Average Rating</div>
                            <div className="personal-info">Intermediate</div>
                        </div>
                    </div>
                </div>

                <Link to={"/edit-profile"} className="edit-profile-btn">
                    <div className="profile-btn">Edit Profile</div>
                </Link>

            </div>
        </div>
    )
}
