import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useCustomAuth } from '../context/AuthContext'
import './NotificationBell.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export const NotificationBell = () => {
    const { isAuthenticated, getAccessTokenSilently } = useAuth0()
    const { customAuth } = useCustomAuth()

    const loggedIn = isAuthenticated || !!customAuth

    const [userId, setUserId] = useState(null)
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifications, setNotifications] = useState([])
    const [open, setOpen] = useState(false)
    const [loadingNotifs, setLoadingNotifs] = useState(false)

    const dropdownRef = useRef(null)
    const pollRef = useRef(null)

    const getToken = useCallback(async () => {
        if (isAuthenticated) {
            return await getAccessTokenSilently({
                authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
            })
        }
        if (customAuth) return customAuth
        return null
    }, [isAuthenticated, customAuth, getAccessTokenSilently])

    // Fetch user_id from /auth/me once on login
    useEffect(() => {
        if (!loggedIn) {
            setUserId(null)
            setUnreadCount(0)
            setNotifications([])
            return
        }

        const fetchUserId = async () => {
            try {
                const token = await getToken()
                if (!token) return
                const res = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (!res.ok) return
                const data = await res.json()
                setUserId(data.user_id)
            } catch (err) {
                console.error('[NotificationBell] Failed to fetch user info:', err)
            }
        }

        fetchUserId()
    }, [loggedIn, getToken])

    // Poll unread count every 60 seconds
    const fetchUnreadCount = useCallback(async () => {
        if (!userId) return
        try {
            const token = await getToken()
            if (!token) return
            const res = await fetch(`${API_BASE_URL}/notifications/${userId}/count`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) return
            const data = await res.json()
            setUnreadCount(data.unread_count)
        } catch (err) {
            console.error('[NotificationBell] Failed to fetch unread count:', err)
        }
    }, [userId, getToken])

    useEffect(() => {
        if (!userId) return
        fetchUnreadCount()
        pollRef.current = setInterval(fetchUnreadCount, 60000)
        return () => clearInterval(pollRef.current)
    }, [userId, fetchUnreadCount])

    // Fetch full notifications when dropdown opens
    const fetchNotifications = useCallback(async () => {
        if (!userId) return
        setLoadingNotifs(true)
        try {
            const token = await getToken()
            if (!token) return
            const res = await fetch(`${API_BASE_URL}/notifications/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) return
            const data = await res.json()
            setNotifications(data)
            setUnreadCount(0) // backend marks all as read on this fetch
        } catch (err) {
            console.error('[NotificationBell] Failed to fetch notifications:', err)
        } finally {
            setLoadingNotifs(false)
        }
    }, [userId, getToken])

    const handleBellClick = () => {
        const next = !open
        setOpen(next)
        if (next) fetchNotifications()
    }

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        if (open) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    const handleDelete = async (notificationId) => {
        try {
            const token = await getToken()
            if (!token) return
            const res = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) return
            setNotifications((prev) => prev.filter((n) => n.notification_id !== notificationId))
        } catch (err) {
            console.error('[NotificationBell] Failed to delete notification:', err)
        }
    }

    const formatTime = (isoString) => {
        const date = new Date(isoString)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        if (diffMins < 1) return 'just now'
        if (diffMins < 60) return `${diffMins}m ago`
        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours}h ago`
        const diffDays = Math.floor(diffHours / 24)
        return `${diffDays}d ago`
    }

    if (!loggedIn) return null

    return (
        <div className="notif-bell-wrapper" ref={dropdownRef}>
            <button
                className="notif-bell-btn"
                onClick={handleBellClick}
                aria-label="Notifications"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {open && (
                <div className="notif-dropdown">
                    <div className="notif-dropdown-header">
                        <span>Notifications</span>
                    </div>

                    {loadingNotifs ? (
                        <div className="notif-empty">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="notif-empty">No notifications</div>
                    ) : (
                        <ul className="notif-list">
                            {notifications.map((n) => (
                                <li key={n.notification_id} className={`notif-item${n.is_read ? '' : ' notif-unread'}`}>
                                    <div className="notif-content">
                                        <p className="notif-message">{n.message}</p>
                                        <span className="notif-time">{formatTime(n.created_at)}</span>
                                    </div>
                                    <button
                                        className="notif-delete-btn"
                                        onClick={() => handleDelete(n.notification_id)}
                                        aria-label="Dismiss notification"
                                    >
                                        &times;
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    )
}
