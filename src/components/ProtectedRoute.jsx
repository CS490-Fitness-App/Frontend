import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useCustomAuth } from '../context/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const AccessDenied = ({ message = 'You do not have permission to view this page.' }) => (
    <div style={{ padding: '48px', fontFamily: "'Space Mono', monospace" }}>
        <h2>Access denied</h2>
        <p>{message}</p>
    </div>
)

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0()
    const { customAuth, currentUser, setCurrentUser } = useCustomAuth()
    const [checkingRole, setCheckingRole] = useState(false)
    const [roleError, setRoleError] = useState('')

    useEffect(() => {
        const loadCurrentUser = async () => {
            if (isLoading || currentUser || (!isAuthenticated && !customAuth)) return

            setCheckingRole(true)
            setRoleError('')
            try {
                const token = isAuthenticated
                    ? await getAccessTokenSilently({
                        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
                    })
                    : customAuth

                const res = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) throw new Error(data.detail || 'Unable to verify access.')
                setCurrentUser(data)
            } catch (err) {
                setRoleError(err.message || 'Unable to verify access.')
            } finally {
                setCheckingRole(false)
            }
        }

        loadCurrentUser()
    }, [isAuthenticated, isLoading, customAuth, currentUser, getAccessTokenSilently, setCurrentUser])

    if (isLoading) return null

    if (!isAuthenticated && !customAuth) {
        return <Navigate to="/" replace />
    }

    if (checkingRole || (!currentUser && !roleError)) return null

    if (roleError) {
        return <AccessDenied message={roleError} />
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser?.role)) {
        return <AccessDenied />
    }

    return children
}
