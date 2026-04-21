import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)
const CUSTOM_AUTH_STORAGE_KEY = 'primalFitnessCustomAuth'

export const AuthProvider = ({ children }) => {
    const [customAuth, setCustomAuth] = useState(() => {
        if (typeof window === 'undefined') {
            return null
        }

        return window.localStorage.getItem(CUSTOM_AUTH_STORAGE_KEY)
    })
    const [backendAuthReady, setBackendAuthReady] = useState(() => !!customAuth)
    const [backendAuthError, setBackendAuthError] = useState('')
    const [profilePicture, setProfilePicture] = useState('')

    const setAuth = (token) => {
        setCustomAuth(token)
        setBackendAuthReady(true)
        setBackendAuthError('')
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(CUSTOM_AUTH_STORAGE_KEY, token)
        }
    }

    const clearAuth = () => {
        setCustomAuth(null)
        setBackendAuthReady(false)
        setBackendAuthError('')
        setProfilePicture('')
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(CUSTOM_AUTH_STORAGE_KEY)
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
            profilePicture,
            setProfilePicture,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useCustomAuth = () => useContext(AuthContext)
