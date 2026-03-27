import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export const AuthSync = () => {
  const { isAuthenticated, isLoading, getAccessTokenSilently, user } = useAuth0()

  useEffect(() => {
    const syncToBackend = async () => {
      if (!isAuthenticated || isLoading || !user) {
        return
      }

      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        })

        // Keep selected role from signup choice so first backend sync can create right entity.
        const selectedRole = localStorage.getItem('pf_signup_role') || 'client'

        await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user.email || null,
            first_name: user.given_name || user.name || null,
            last_name: user.family_name || null,
            profile_picture: user.picture || null,
            role: selectedRole,
          }),
        })
      } catch (error) {
        console.error('Auth sync failed:', error)
      }
    }

    syncToBackend()
  }, [isAuthenticated, isLoading, getAccessTokenSilently, user])

  return null
}
