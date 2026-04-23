import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)
const AUTH_TOKEN_KEY = 'pf_custom_auth_token'
const AUTH_USER_KEY = 'pf_current_user'

const loadStoredUser = () => {
    try {
        const rawUser = localStorage.getItem(AUTH_USER_KEY)
        return rawUser ? JSON.parse(rawUser) : null
    } catch {
        localStorage.removeItem(AUTH_USER_KEY)
        return null
    }
}

export const AuthProvider = ({ children }) => {
    const [customAuth, setCustomAuth] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY))
    const [currentUserState, setCurrentUserState] = useState(loadStoredUser)

    const setAuth = (token) => {
        setCustomAuth(token)
        if (token) {
            localStorage.setItem(AUTH_TOKEN_KEY, token)
        } else {
            localStorage.removeItem(AUTH_TOKEN_KEY)
        }
    }

    const setCurrentUser = (user) => {
        setCurrentUserState(user)
        if (user) {
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
        } else {
            localStorage.removeItem(AUTH_USER_KEY)
        }
    }

    const clearAuth = () => {
        setAuth(null)
        setCurrentUser(null)
    }

    return (
        <AuthContext.Provider value={{ customAuth, setAuth, clearAuth, currentUser: currentUserState, setCurrentUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useCustomAuth = () => useContext(AuthContext)
