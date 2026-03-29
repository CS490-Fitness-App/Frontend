import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [customAuth, setCustomAuth] = useState(null)

    const setAuth = (token) => setCustomAuth(token)
    const clearAuth = () => setCustomAuth(null)

    return (
        <AuthContext.Provider value={{ customAuth, setAuth, clearAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useCustomAuth = () => useContext(AuthContext)
