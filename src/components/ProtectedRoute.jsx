import { Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useCustomAuth } from '../context/AuthContext'

const AccessDenied = ({ message = 'You do not have permission to view this page.' }) => (
    <div style={{ padding: '48px', fontFamily: "'Space Mono', monospace" }}>
        <h2>Access denied</h2>
        <p>{message}</p>
    </div>
)

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, isLoading } = useAuth0()
    const { customAuth, backendAuthReady, backendAuthError, userRole } = useCustomAuth()

    if (isLoading) return null

    if (!isAuthenticated && !customAuth) {
        return <Navigate to="/" replace />
    }

    if (isAuthenticated && !backendAuthReady) {
        if (backendAuthError) {
            return <div style={{ padding: '2rem' }}>{backendAuthError}</div>
        }

        return null
    }

    if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
        return <AccessDenied />
    }

    return children
}
