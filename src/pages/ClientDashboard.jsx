import React, { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useCustomAuth } from '../context/AuthContext'
import { Sidebar } from "../components/Sidebar"
import './Pages.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export const ClientDashboard = () => {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0()
    const { customAuth } = useCustomAuth()
    const [name, setName] = useState('')

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                let token
                if (isAuthenticated) {
                    token = await getAccessTokenSilently({
                        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
                    })
                } else if (customAuth) {
                    token = customAuth
                } else {
                    return
                }

                const res = await fetch(`${API_BASE_URL}/dashboard/client`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (res.ok) {
                    const data = await res.json()
                    setName(data.name)
                }
            } catch (err) {
                console.error('Failed to load dashboard:', err)
            }
        }
        fetchDashboard()
    }, [isAuthenticated, customAuth, getAccessTokenSilently])

    return (
        <div>
            <div className="page-heading">
                <div className="h2">
                    <span className="text-black">Welcome back, </span>
                    <span className="text-purple">{name || '...'}</span>
                </div>
            </div>
            <Sidebar />
        </div>
    )
}
