import "./Navbar.css"
import React from 'react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useCustomAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../utils/apiBaseUrl'
import { resolveMediaUrl } from '../utils/mediaUrl'

import { LoginForm } from "./LoginForm"
import { NotificationBell } from "./NotificationBell"

export const Navbar = () => {
    const { isAuthenticated, logout, getAccessTokenSilently, user, isLoading } = useAuth0()
    const { customAuth, clearAuth, profilePicture, setProfilePicture, userRole } = useCustomAuth()
    const navigate = useNavigate()

    const loggedIn = isAuthenticated || !!customAuth

    const getDashboardRoute = () => {
        if (userRole === 'admin') return '/admin-dashboard'
        if (userRole === 'coach') return '/coach-dashboard'
        return '/client-dashboard'
    }

    const [isModalOpen, setIsModalOpen] = useState(false)
    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)

    useEffect(() => {
        const loadProfilePicture = async () => {
            if (!loggedIn) {
                setProfilePicture('')
                return
            }

            try {
                let token = null
                if (isAuthenticated) {
                    if (isLoading || !user) {
                        return
                    }
                    token = await getAccessTokenSilently({
                        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
                    })
                } else if (customAuth) {
                    token = customAuth
                }

                if (!token) {
                    setProfilePicture(user?.picture || '')
                    return
                }

                const response = await fetch(`${API_BASE_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                })

                const body = await response.json().catch(() => ({}))
                if (response.ok) {
                    setProfilePicture(body.profile_picture || user?.picture || '')
                    return
                }

                setProfilePicture(user?.picture || '')
            } catch {
                setProfilePicture(user?.picture || '')
            }
        }

        loadProfilePicture()
    }, [customAuth, getAccessTokenSilently, isAuthenticated, isLoading, loggedIn, setProfilePicture, user])

    const handleLogout = () => {
        if (customAuth) {
            clearAuth()
            navigate('/')
        }
        if (isAuthenticated) {
            logout({ logoutParams: { returnTo: window.location.origin } })
        }
    }

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
                    <div className="nav-title">PrimalFitness</div>
                </Link>
                <ul>
                    <li><NavLink to="/exercises">Exercises</NavLink></li>
                    <li><NavLink to={getDashboardRoute()}>Dashboard</NavLink></li>
                    <li><NavLink to="/workouts">Workouts</NavLink></li>
                    <li><NavLink to="/survey">Survey</NavLink></li>
                    {loggedIn && (
                        <li className="nav-bell-item">
                            <NotificationBell />
                        </li>
                    )}
                    <li>
                        {loggedIn
                            ? <NavLink onClick={handleLogout}>Log Out</NavLink>
                            : <NavLink onClick={openModal}>Log In</NavLink>
                        }
                    </li>
                    {loggedIn && (
                        <li>
                            <Link to="/profile" className="nav-profile-avatar-link" aria-label="Open profile page">
                                <div className="nav-profile-avatar">
                                    {profilePicture ? (
                                        <img
                                            src={resolveMediaUrl(profilePicture)}
                                            alt="Profile"
                                            className="nav-profile-avatar-image"
                                        />
                                    ) : (
                                        <span>{(user?.given_name?.[0] || user?.name?.[0] || 'U').toUpperCase()}</span>
                                    )}
                                </div>
                            </Link>
                        </li>
                    )}
                </ul>
            </nav>
            {!loggedIn && <LoginForm isOpen={isModalOpen} onClose={closeModal} />}
        </div>
    )
}
