import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useCustomAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../utils/apiBaseUrl'

const AccessDenied = ({ message = 'You do not have permission to view this page.' }) => (
    <div style={{ padding: '48px', fontFamily: "'Space Mono', monospace" }}>
        <h2>Access denied</h2>
        <p>{message}</p>
    </div>
)

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0()
    const {
        customAuth,
        backendAuthReady,
        backendAuthError,
        backendAuthMeta,
        setBackendAuthReady,
        setBackendAuthError,
        setBackendAuthMeta,
        userRole,
    } = useCustomAuth()
    const [reactivating, setReactivating] = useState(false)
    const [reactivateError, setReactivateError] = useState('')

    const handleReactivate = async () => {
        try {
            setReactivating(true)
            setReactivateError('')

            const token = isAuthenticated
                ? await getAccessTokenSilently({
                    authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
                })
                : customAuth

            if (!token) {
                throw new Error('Unable to authenticate reactivation request.')
            }

            const response = await fetch(`${API_BASE_URL}/users/me/reactivate`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            const body = await response.json().catch(() => ({}))
            if (!response.ok) {
                throw new Error(body.detail || 'Failed to reactivate account.')
            }

            setBackendAuthError('')
            setBackendAuthMeta(null)
            setBackendAuthReady(false)
            window.location.reload()
        } catch (err) {
            setReactivateError(err.message || 'Failed to reactivate account.')
        } finally {
            setReactivating(false)
        }
    }

    const AccountUnavailable = ({ message }) => (
        <div style={{ padding: '48px', fontFamily: "'Space Mono', monospace" }}>
            <h2>Account unavailable</h2>
            <p>{message}</p>
            {backendAuthMeta?.remaining_days != null && (
                <p>{backendAuthMeta.remaining_days} day(s) remaining before permanent deletion.</p>
            )}
            {backendAuthMeta?.scheduled_deletion_at && (
                <p>Scheduled deletion: {new Date(backendAuthMeta.scheduled_deletion_at).toLocaleString()}</p>
            )}
            {backendAuthMeta?.deactivated_by_admin && (
                <p>Only an administrator can restore this account.</p>
            )}
            {backendAuthMeta?.can_self_reactivate && !backendAuthMeta?.deactivated_by_admin && backendAuthMeta?.scheduled_deletion_at && (
                <div style={{ marginTop: '16px' }}>
                    {reactivateError && <p style={{ color: '#b91c1c' }}>{reactivateError}</p>}
                    <button
                        type="button"
                        onClick={handleReactivate}
                        disabled={reactivating}
                        style={{
                            border: '2px solid black',
                            background: '#dde0ff',
                            padding: '10px 18px',
                            fontFamily: "'Space Mono', monospace",
                            textTransform: 'uppercase',
                            cursor: reactivating ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {reactivating ? 'Reactivating...' : 'Reactivate Account'}
                    </button>
                </div>
            )}
        </div>
    )

    if (isLoading) return null

    if (!isAuthenticated && !customAuth) {
        return <Navigate to="/" replace />
    }

    if (isAuthenticated && !backendAuthReady) {
        if (backendAuthError) {
            if (backendAuthMeta?.code === 'self_deactivated' || backendAuthMeta?.code === 'admin_deactivated' || backendAuthError.toLowerCase().includes('deactivated') || backendAuthError.toLowerCase().includes('inactive')) {
                return <AccountUnavailable message={backendAuthError} />
            }
            return <div style={{ padding: '2rem' }}>{backendAuthError}</div>
        }

        return null
    }

    if (!isAuthenticated && customAuth && !backendAuthReady) {
        if (backendAuthError) {
            if (backendAuthMeta?.code === 'self_deactivated' || backendAuthMeta?.code === 'admin_deactivated' || backendAuthError.toLowerCase().includes('deactivated') || backendAuthError.toLowerCase().includes('inactive')) {
                return <AccountUnavailable message={backendAuthError} />
            }
            return <div style={{ padding: '2rem' }}>{backendAuthError}</div>
        }
        return null
    }

    if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
        return <AccessDenied />
    }

    return children
}
