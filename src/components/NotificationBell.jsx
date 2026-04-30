import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { useCustomAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../utils/apiBaseUrl'
import './NotificationBell.css'

const DAILY_CHECKIN_REMINDER_ID = 0
const DAILY_CHECKIN_REMINDER_MESSAGE = 'Daily Check-in'

const getLocalDateString = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const parseUTC = (str) => new Date(str ? str.replace(' ', 'T').replace(/(?<!\+\d{2}:\d{2}|Z)$/, 'Z') : null)

export const NotificationBell = () => {
    const { isAuthenticated, getAccessTokenSilently } = useAuth0()
    const { customAuth, userRole } = useCustomAuth()
    const navigate = useNavigate()

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
    const fetchDailyCheckInStatus = useCallback(async () => {
        if (!loggedIn || userRole !== 'client') {
            return false
        }

        try {
            const token = await getToken()
            if (!token) return false
            const today = getLocalDateString()
            const tzOffsetMinutes = new Date().getTimezoneOffset()
            const res = await fetch(`${API_BASE_URL}/logs/daily-checkin/status?for_date=${today}&tz_offset_minutes=${tzOffsetMinutes}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) return false
            const data = await res.json()
            return !data.completed
        } catch (err) {
            console.error('[NotificationBell] Failed to fetch daily check-in status:', err)
            return false
        }
    }, [loggedIn, userRole, getToken])

    const fetchUnreadCount = useCallback(async () => {
        if (!userId) return
        const shouldShowReminder = await fetchDailyCheckInStatus()

        try {
            const token = await getToken()
            if (!token) return

            // Run billing reminder/auto-charge poll first so payment notifications
            // appear in the unread count for both clients and coaches.
            await fetch(`${API_BASE_URL}/payments/billing/poll`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            }).catch(() => null)

            const res = await fetch(`${API_BASE_URL}/notifications/${userId}/count`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) {
                setUnreadCount(shouldShowReminder ? 1 : 0)
                return
            }
            const data = await res.json()
            setUnreadCount(data.unread_count + (shouldShowReminder ? 1 : 0))
        } catch (err) {
            console.error('[NotificationBell] Failed to fetch unread count:', err)
            setUnreadCount(shouldShowReminder ? 1 : 0)
        }
    }, [userId, getToken, fetchDailyCheckInStatus])

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
        const shouldShowReminder = await fetchDailyCheckInStatus()
        const reminderNotifications = shouldShowReminder
            ? [{
                notification_id: DAILY_CHECKIN_REMINDER_ID,
                user_id: userId,
                message: DAILY_CHECKIN_REMINDER_MESSAGE,
                is_read: false,
                created_at: new Date().toISOString(),
            }]
            : []

        try {
            const token = await getToken()
            if (!token) return
            const res = await fetch(`${API_BASE_URL}/notifications/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) {
                setNotifications(reminderNotifications)
                setUnreadCount(shouldShowReminder ? 1 : 0)
                return
            }
            const data = await res.json()
            const nextNotifications = [...reminderNotifications, ...data]
            setNotifications(nextNotifications)
            setUnreadCount(shouldShowReminder ? 1 : 0)
        } catch (err) {
            console.error('[NotificationBell] Failed to fetch notifications:', err)
            setNotifications(reminderNotifications)
            setUnreadCount(shouldShowReminder ? 1 : 0)
        } finally {
            setLoadingNotifs(false)
        }
    }, [userId, getToken, fetchDailyCheckInStatus])

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
        if (notificationId <= 0) {
            setNotifications((prev) => prev.filter((n) => n.notification_id !== notificationId))
            return
        }

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

    const handleNotificationClick = (notification) => {
        if (notification.notification_id === DAILY_CHECKIN_REMINDER_ID) {
            setOpen(false)
            navigate('/client-dashboard', { state: { openDailyCheckIn: true } })
        }
    }

    const formatTime = (isoString) => {
        const date = parseUTC(isoString)
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
                                <li
                                    key={n.notification_id}
                                    className={`notif-item${n.is_read ? '' : ' notif-unread'}${n.notification_id === DAILY_CHECKIN_REMINDER_ID ? ' notif-item-action' : ''}`}
                                    onClick={() => handleNotificationClick(n)}
                                >
                                    <div className="notif-content">
                                        <p className="notif-message">{n.message}</p>
                                        <span className="notif-time">
                                            {n.notification_id === DAILY_CHECKIN_REMINDER_ID ? 'Open daily check-in' : formatTime(n.created_at)}
                                        </span>
                                    </div>
                                    {n.notification_id > 0 && (
                                        <button
                                            className="notif-delete-btn"
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                handleDelete(n.notification_id)
                                            }}
                                            aria-label="Dismiss notification"
                                        >
                                            &times;
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    )
}
