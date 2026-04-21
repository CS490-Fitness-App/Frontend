import { Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useCustomAuth } from '../context/AuthContext'

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth0()
    const { customAuth, backendAuthReady, backendAuthError } = useCustomAuth()

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

    return children
}
