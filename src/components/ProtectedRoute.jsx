import { Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useCustomAuth } from '../context/AuthContext'

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth0()
    const { customAuth } = useCustomAuth()

    if (isLoading) return null

    if (!isAuthenticated && !customAuth) {
        return <Navigate to="/" replace />
    }

    return children
}
