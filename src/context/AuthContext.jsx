import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)
const CUSTOM_AUTH_STORAGE_KEY = 'primalFitnessCustomAuth'
const ROLE_STORAGE_KEY = 'primalFitnessUserRole'

export const AuthProvider = ({ children }) => {
    const [customAuth, setCustomAuth] = useState(() => {
        if (typeof window === 'undefined') {
            return null
        }

        return window.localStorage.getItem(CUSTOM_AUTH_STORAGE_KEY)
    })
    const [backendAuthReady, setBackendAuthReady] = useState(false)
    const [backendAuthError, setBackendAuthError] = useState('')
    const [backendAuthMeta, setBackendAuthMeta] = useState(null)
    const [profilePicture, setProfilePicture] = useState('')
    const [userRole, setUserRoleState] = useState(() => {
        if (typeof window === 'undefined') return null
        return window.localStorage.getItem(ROLE_STORAGE_KEY) || null
    })

    const setAuth = (token, role = null) => {
        setCustomAuth(token)
        setBackendAuthReady(true)
        setBackendAuthError('')
        setBackendAuthMeta(null)
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(CUSTOM_AUTH_STORAGE_KEY, token)
        }
        if (role) {
            setUserRoleState(role)
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(ROLE_STORAGE_KEY, role)
            }
        }
    }

    const setUserRole = (role) => {
        setUserRoleState(role)
        if (typeof window !== 'undefined') {
            if (role) {
                window.localStorage.setItem(ROLE_STORAGE_KEY, role)
            } else {
                window.localStorage.removeItem(ROLE_STORAGE_KEY)
            }
        }
    }

    const clearAuth = () => {
        setCustomAuth(null)
        setBackendAuthReady(false)
        setBackendAuthError('')
        setBackendAuthMeta(null)
        setProfilePicture('')
        setUserRoleState(null)
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(CUSTOM_AUTH_STORAGE_KEY)
            window.localStorage.removeItem(ROLE_STORAGE_KEY)
        }
    }

    return (
        <AuthContext.Provider value={{
            customAuth,
            setAuth,
            clearAuth,
            backendAuthReady,
            setBackendAuthReady,
            backendAuthError,
            setBackendAuthError,
            backendAuthMeta,
            setBackendAuthMeta,
            profilePicture,
            setProfilePicture,
            userRole,
            setUserRole,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useCustomAuth = () => useContext(AuthContext)
