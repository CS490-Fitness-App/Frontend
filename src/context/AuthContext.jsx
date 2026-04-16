import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [customAuth, setCustomAuth] = useState(() => localStorage.getItem('customAuth'))

    const setAuth = (token) => {
        localStorage.setItem('customAuth', token)
        setCustomAuth(token)
    }
    const clearAuth = () => {
        localStorage.removeItem('customAuth')
        setCustomAuth(null)
    }

    return (
        <AuthContext.Provider value={{ customAuth, setAuth, clearAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useCustomAuth = () => useContext(AuthContext)
