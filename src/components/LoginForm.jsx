import "./LoginForm.css"
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

import { MdEmail } from "react-icons/md";
import { IoMdLock } from "react-icons/io";
import { FaGoogle } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { FaUser } from "react-icons/fa";

export const LoginForm = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { loginWithRedirect } = useAuth0();

    const [view, setView] = useState('login');

    const loginStyle = {
        transform: view === 'login' ? 'translateX(0)' : 'translateX(-650px)',
        transition: 'transform 0.3s ease',
        top: 0
    };

    const registrationStyle = {
        transform: view === 'signup' ? 'translateX(0)' : 'translateX(650px)',
        transition: 'transform 0.3s ease',
        position: 'absolute',
        top: 0
    };

    const [rememberMe, setRememberMe] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('client');

    const handleSubmit = async (e) => {
        e.preventDefault();

    
        localStorage.setItem('pf_signup_role', role);

        if (view === 'signup') {
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            await loginWithRedirect({
                authorizationParams: {
                    screen_hint: 'signup',
                },
                appState: { returnTo: '/client-dashboard' },
            });
            return;
        }

        await loginWithRedirect({
            authorizationParams: {
                screen_hint: 'login',
            },
            appState: { returnTo: '/client-dashboard' },
        });

        navigate('/client-dashboard', { state: { role } });
        if (onClose) {
            onClose();
        }
    };

    const handleGoogleSignUp = async () => {
        localStorage.setItem('pf_signup_role', role);
        await loginWithRedirect({
            authorizationParams: {
                connection: 'google-oauth2',
            },
            appState: { returnTo: '/client-dashboard' },
        });
    };

    return (
        <div className={`modal-container ${isOpen ? 'open' : ''}`}>
            <div className={`modal-content ${isOpen ? 'open' : ''}`}>

                <div className="login" style={loginStyle}>
                    <MdCancel className="cancel" onClick={onClose} />

                    <div className="page-title">
                        <h1>LOG <span className="accent">IN</span></h1>
                    </div>

                    <div className="signup-form-section">
                        <form className="signup-form-container" onSubmit={handleSubmit}>

                            <input
                                type="email"
                                className="form-input-dark"
                                placeholder="EMAIL"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <input
                                type="password"
                                className="form-input-dark"
                                placeholder="PASSWORD"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <input
                                type="password"
                                className="form-input-dark"
                                placeholder="CONFIRM PASSWORD"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />

                            <div className="forget-section">
                                <div
                                    className={`checkbox-item ${rememberMe ? 'checked' : ''}`}
                                    onClick={() => setRememberMe(!rememberMe)}
                                >
                                    {/* Hidden real input for form data */}
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        checked={rememberMe}
                                        onChange={() => { }} // Handled by div click
                                        style={{ display: 'none' }}
                                    />

                                    {/* Your custom styled box */}
                                    <div className="checkbox-box">
                                        {rememberMe && "✓"} {/* Shows checkmark when true */}
                                    </div>

                                    {/* Your text */}
                                    <span className="checkbox-text">Remember Me</span>
                                </div>

                                <a href="#" className="login-link">Forget Password</a>
                            </div>

                            <button type="submit" className="signup-btn">LOG IN</button>

                            <div className="signup-divider">
                                <div className="signup-divider-line"></div>
                                <span className="signup-divider-text">OR LOG IN WITH</span>
                                <div className="signup-divider-line"></div>
                            </div>

                            <button type="button" className="google-btn" onClick={handleGoogleSignUp}>
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                SIGN UP WITH GOOGLE
                            </button>

                            <div className="login-link">
                                Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setView('signup'); }}>Sign up now</a>
                            </div>
                        </form>
                    </div> 
                </div>

                <div className="registration" style={registrationStyle}>
                    <MdCancel className="cancel" onClick={onClose} />

                    <div className="page-title">
                        <h1>CREATE <span className="accent">ACCOUNT</span></h1>
                    </div>

                    <div className="signup-form-section">
                        <form className="signup-form-container" onSubmit={handleSubmit}>
                            <div className="signup-form-row">
                                <input
                                    type="text"
                                    className="form-input-dark"
                                    placeholder="FIRST NAME"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                                <input
                                    type="text"
                                    className="form-input-dark"
                                    placeholder="LAST NAME"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </div>

                            <input
                                type="email"
                                className="form-input-dark"
                                placeholder="EMAIL"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <input
                                type="password"
                                className="form-input-dark"
                                placeholder="PASSWORD"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <input
                                type="password"
                                className="form-input-dark"
                                placeholder="CONFIRM PASSWORD"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />

                            <div className="role-selector">
                                <div className="role-label">I am a...</div>
                                <div className="role-options">
                                    <div
                                        className={`role-option ${role === 'client' ? 'selected' : ''}`}
                                        onClick={() => setRole('client')}
                                    >
                                        CLIENT
                                    </div>
                                    <div
                                        className={`role-option ${role === 'coach' ? 'selected' : ''}`}
                                        onClick={() => setRole('coach')}
                                    >
                                        COACH
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="signup-btn">SIGN UP</button>

                            <div className="signup-divider">
                                <div className="signup-divider-line"></div>
                                <span className="signup-divider-text">OR SIGN UP WITH</span>
                                <div className="signup-divider-line"></div>
                            </div>

                            <button type="button" className="google-btn" onClick={handleGoogleSignUp}>
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                SIGN UP WITH GOOGLE
                            </button>

                            <div className="login-link">
                                Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setView('login'); }}>Log in</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}