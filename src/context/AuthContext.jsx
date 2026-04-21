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

    const setAuth = (token) => {
        setCustomAuth(token)
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(CUSTOM_AUTH_STORAGE_KEY, token)
        }
    }

    const clearAuth = () => {
        setCustomAuth(null)
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(CUSTOM_AUTH_STORAGE_KEY)
        }
    }

    return (
        <AuthContext.Provider value={{ customAuth, setAuth, clearAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useCustomAuth = () => useContext(AuthContext)
