import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export const AuthSync = () => {
  const { isAuthenticated, isLoading, getAccessTokenSilently, user } = useAuth0()
  const navigate = useNavigate()

  const getDashboardRoute = (role) => {
    if (role === 'admin') return '/admin-dashboard'
    if (role === 'coach') return '/coach-dashboard'
    return '/client-dashboard'
  }

  useEffect(() => {
    const syncToBackend = async () => {
      if (!isAuthenticated || isLoading || !user) return

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
          const body = await res.json().catch(() => ({}))
          console.error(`[AuthSync] Backend returned ${res.status}:`, body.detail ?? body)
        } else {
          const body = await res.json().catch(() => ({}))
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
        console.error('Auth sync failed:', error)
      }

      // Navigate after a fresh login/signup regardless of whether backend sync succeeded.
      if (shouldNavigate) navigate('/client-dashboard')
    }

    syncToBackend()
  }, [isAuthenticated, isLoading, getAccessTokenSilently, user, navigate])

  return null
}
