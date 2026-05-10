import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../utils/apiBaseUrl'
import { useCustomAuth } from '../context/AuthContext'

const readErrorPayload = async (response, fallbackMessage) => {
  const rawBody = await response.text().catch(() => '')

  if (!rawBody) {
    return { message: fallbackMessage, detail: fallbackMessage }
  }

  try {
    const parsedBody = JSON.parse(rawBody)
    const detail = parsedBody.detail || parsedBody.message || fallbackMessage
    return {
      message: typeof detail === 'string' ? detail : detail?.message || fallbackMessage,
      detail,
    }
  } catch {
    return { message: rawBody, detail: rawBody }
  }
}

export const AuthSync = () => {
  const { isAuthenticated, isLoading, getAccessTokenSilently, user } = useAuth0()
  const { customAuth, setBackendAuthReady, setBackendAuthError, setBackendAuthMeta, setUserRole } = useCustomAuth()
  const navigate = useNavigate()

  const getDashboardRoute = (role) => {
    if (role === 'admin') return '/dashboard/admin'
    if (role === 'coach') return '/coach-dashboard'
    return '/client-dashboard'
  }

  useEffect(() => {
    const syncToBackend = async () => {
      if (isLoading) return

      if (!isAuthenticated && !customAuth) {
        setBackendAuthReady(false)
        setBackendAuthError('')
        setBackendAuthMeta(null)
        return
      }

      if (!isAuthenticated && customAuth) {
        setBackendAuthReady(false)
        setBackendAuthError('')
        setBackendAuthMeta(null)
        try {
          const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${customAuth}` },
          })

          if (!res.ok) {
            const payload = await readErrorPayload(res, 'Failed to validate your account.')
            setBackendAuthError(payload.message)
            setBackendAuthMeta(typeof payload.detail === 'object' ? payload.detail : null)
            setUserRole(typeof payload.detail === 'object' ? payload.detail.role || null : null)
            return
          }

          const body = await res.json().catch(() => ({}))
          setBackendAuthReady(true)
          setBackendAuthError('')
          setBackendAuthMeta(null)
          setUserRole(body.role || null)
        } catch (error) {
          const message = error?.message || 'Failed to validate your account.'
          setBackendAuthError(message)
          setBackendAuthMeta(null)
          setUserRole(null)
          console.error('Custom auth validation failed:', error)
        }
        return
      }

      if (!user) {
        setBackendAuthReady(false)
        return
      }

      setBackendAuthReady(false)
      setBackendAuthError('')
      setBackendAuthMeta(null)

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
          const payload = await readErrorPayload(res, 'Failed to sync account with backend.')
          setBackendAuthError(payload.message)
          setBackendAuthMeta(typeof payload.detail === 'object' ? payload.detail : null)
          setUserRole(typeof payload.detail === 'object' ? payload.detail.role || null : null)
          console.error(`[AuthSync] Backend returned ${res.status}:`, payload.detail)
        } else {
          const body = await res.json().catch(() => ({}))
          setBackendAuthReady(true)
          setBackendAuthError('')
          setBackendAuthMeta(null)
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
        setBackendAuthMeta(null)
        console.error('Auth sync failed:', error)
      }

      // Do not navigate into protected routes until backend sync succeeds.
    }

    syncToBackend()
  }, [isAuthenticated, isLoading, getAccessTokenSilently, user, navigate, setBackendAuthError, setBackendAuthReady, customAuth, setUserRole, setBackendAuthMeta])

  return null
}
