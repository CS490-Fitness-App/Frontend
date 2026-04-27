import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../utils/apiBaseUrl'
import { useCustomAuth } from '../context/AuthContext'

const readErrorDetail = async (response, fallbackMessage) => {
  const rawBody = await response.text().catch(() => '')

  if (!rawBody) {
    return fallbackMessage
  }

  try {
    const parsedBody = JSON.parse(rawBody)
    return parsedBody.detail || parsedBody.message || rawBody || fallbackMessage
  } catch {
    return rawBody
  }
}

export const AuthSync = () => {
  const { isAuthenticated, isLoading, getAccessTokenSilently, user } = useAuth0()
  const { setBackendAuthReady, setBackendAuthError, setUserRole } = useCustomAuth()
  const navigate = useNavigate()

  const getDashboardRoute = (role) => {
    if (role === 'admin') return '/dashboard/admin'
    if (role === 'coach') return '/coach-dashboard'
    return '/client-dashboard'
  }

  useEffect(() => {
    const syncToBackend = async () => {
      if (isLoading) return

      if (!isAuthenticated) {
        setBackendAuthReady(false)
        setBackendAuthError('')
        return
      }

      if (!user) {
        setBackendAuthReady(false)
        return
      }

      setBackendAuthReady(false)
      setBackendAuthError('')

      // Capture and clear pendingAuth before any async work so it only fires once.
      const shouldNavigate = !!sessionStorage.getItem('pendingAuth')
      if (shouldNavigate) sessionStorage.removeItem('pendingAuth')

      // Use signup form data if present, fall back to Auth0 profile claims.
      const raw = sessionStorage.getItem('pendingSignup')
      const signupData = raw ? JSON.parse(raw) : null
      if (raw) sessionStorage.removeItem('pendingSignup')

      const requestedRole = signupData?.role || 'client'

      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        })

        // Debug: log token claims to verify iss/aud are correct.
        try {
          const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
          console.log('[AuthSync] Token claims:', { iss: payload.iss, aud: payload.aud, sub: payload.sub })
        } catch { /* opaque token */ }

        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user.email || null,
            first_name: signupData?.first_name || user.given_name || user.name || null,
            last_name: signupData?.last_name || user.family_name || null,
            profile_picture: user.picture || null,
            role: requestedRole,
          }),
        })

        if (!res.ok) {
          const detail = await readErrorDetail(res, 'Failed to sync account with backend.')
          setBackendAuthError(detail)
          console.error(`[AuthSync] Backend returned ${res.status}:`, detail)
        } else {
          const body = await res.json().catch(() => ({}))
          setBackendAuthReady(true)
          setBackendAuthError('')
          setUserRole(body.role || requestedRole)
          if (shouldNavigate) {
            if (body.is_new_user) {
              navigate('/survey', { state: { role: body.role || requestedRole } })
            } else {
              navigate(getDashboardRoute(body.role || requestedRole))
            }
          }
          return
        }
      } catch (error) {
        const message = error?.message || error?.error_description || 'Failed to sync account with backend.'
        setBackendAuthError(message)
        console.error('Auth sync failed:', error)
      }

      // Do not navigate into protected routes until backend sync succeeds.
    }

    syncToBackend()
  }, [isAuthenticated, isLoading, getAccessTokenSilently, user, navigate, setBackendAuthError, setBackendAuthReady])

  return null
}
