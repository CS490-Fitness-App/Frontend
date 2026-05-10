import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginForm } from "../components/LoginForm"
import './Pages.css'

export const Login = () => {
    const navigate = useNavigate()
    return (
        <div>
            <div className="page-heading">
                <div className="h2">
                    <span className="text-black">Log </span>
                    <span className="text-purple">In</span>
                </div>
            </div>
            <LoginForm isOpen={true} onClose={() => navigate('/')} />
        </div>
    )
}