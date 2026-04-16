import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [customAuth, setCustomAuth] = useState(() => localStorage.getItem('customAuth'))
    const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole'))

    const setAuth = (token, role) => {
        localStorage.setItem('customAuth', token)
        setCustomAuth(token)
        if (role) {
            localStorage.setItem('userRole', role)
            setUserRole(role)
        }
    }
    const clearAuth = () => {
        localStorage.removeItem('customAuth')
        localStorage.removeItem('userRole')
        setCustomAuth(null)
        setUserRole(null)
    }

    return (
        <AuthContext.Provider value={{ customAuth, userRole, setAuth, clearAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useCustomAuth = () => useContext(AuthContext)
