import "./LoginForm.css"
import React, { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { MdCancel } from "react-icons/md"
import { useCustomAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../utils/apiBaseUrl'

const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN?.trim()
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID?.trim()
const AUTH0_AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE?.trim()

const isInvalidAudiencePasswordGrantError = (tokenData) => {
    const detail = `${tokenData?.error_description || ''} ${tokenData?.error || ''}`.toLowerCase()
    return detail.includes('invalid audience specified for password grant exchange')
}

const buildAudienceCandidates = (audience) => {
    const base = (audience || '').trim()
    if (!base) return []

    const withSlash = base.endsWith('/') ? base : `${base}/`
    const withoutSlash = base.replace(/\/+$/, '')
    const variants = [
        base,
        withSlash,
        withoutSlash,
        base.toLowerCase(),
        withSlash.toLowerCase(),
        withoutSlash.toLowerCase(),
    ]

    return Array.from(new Set(variants.filter(Boolean)))
}

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
)

const readErrorDetail = async (response, fallbackMessage) => {
    const rawBody = await response.text().catch(() => '')

    if (!rawBody) {
        return fallbackMessage
    }

    try {
        const parsedBody = JSON.parse(rawBody)
        return parsedBody.detail || parsedBody.message || rawBody || fallbackMessage
    } catch {
        return rawBody
    }
}

export const LoginForm = ({ isOpen, onClose }) => {
    const { loginWithRedirect } = useAuth0()
    const { setAuth } = useCustomAuth()
    const navigate = useNavigate()

    const [view, setView] = useState('login')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [role, setRole] = useState('client')

    const loginStyle = {
        transform: view === 'login' ? 'translate(0px, 0px)' : 'translate(-650px, 0px)',
        transition: 'transform 0.3s ease',
        top: 0,
    }
    const registrationStyle = {
        transform: view === 'signup' ? 'translate(0px, 0px)' : 'translate(650px, 0px)',
        transition: 'transform 0.3s ease',
        position: 'absolute',
        top: 0,
    }

    const getDashboardRoute = (role) => {
        if (role === 'admin') return '/dashboard/admin'
        if (role === 'coach') return '/coach-dashboard'
        return '/client-dashboard'
    }

    const ensureAuth0Config = () => {
        const missing = []
        if (!AUTH0_DOMAIN) missing.push('VITE_AUTH0_DOMAIN')
        if (!AUTH0_CLIENT_ID) missing.push('VITE_AUTH0_CLIENT_ID')
        if (!AUTH0_AUDIENCE) missing.push('VITE_AUTH0_AUDIENCE')
        if (missing.length) {
            throw new Error(`Missing frontend env: ${missing.join(', ')}. Update Frontend/.env and restart Vite.`)
        }
    }

    // --- shared: get token via ROPG then sync to backend ---
    const loginWithPassword = async (email, password, payload) => {
        ensureAuth0Config()

        let tokenData = {}
        let tokenRes = null
        const audiencesToTry = buildAudienceCandidates(AUTH0_AUDIENCE)

        for (let i = 0; i < audiencesToTry.length; i += 1) {
            const candidateAudience = audiencesToTry[i]
            tokenRes = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
                    realm: 'Username-Password-Authentication',
                    client_id: AUTH0_CLIENT_ID,
                    audience: candidateAudience,
                    scope: 'openid profile email',
                    username: email,
                    password,
                }),
            })

            tokenData = await tokenRes.json().catch(() => ({}))
            if (tokenRes.ok) {
                break
            }

            if (!isInvalidAudiencePasswordGrantError(tokenData) || i === audiencesToTry.length - 1) {
                throw new Error(tokenData.error_description || tokenData.error || 'Invalid email or password')
            }
        }

        // Sync user to our backend
        const syncRes = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${tokenData.access_token}`,
            },
            body: JSON.stringify(payload),
        })

        if (!syncRes.ok) {
            const detail = await readErrorDetail(syncRes, 'Failed to sync account with backend')
            throw new Error(detail)
        }

        const syncData = await syncRes.json().catch(() => ({}))

        return {
            access_token: tokenData.access_token,
            role: syncData.role || payload.role || 'client',
            is_new_user: syncData.is_new_user ?? false,
        }
    }

    // --- Login ---
    const handleLoginSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const result = await loginWithPassword(email, password, {
                email,
                first_name: null,
                last_name: null,
                profile_picture: null,
                role: 'client',
            })
            setAuth(result.access_token, result.role)
            onClose()
            navigate(getDashboardRoute(result.role))
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // --- Signup ---

    const handleSignupSubmit = async (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }
        setError(null)
        setLoading(true)
        try {
            // Step 1: create account in Auth0's database connection
            const signupRes = await fetch(`https://${AUTH0_DOMAIN}/dbconnections/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: AUTH0_CLIENT_ID,
                    email,
                    password,
                    connection: 'Username-Password-Authentication',
                    given_name: firstName,
                    family_name: lastName,
                }),
            })
            const signupData = await signupRes.json()
            if (!signupRes.ok) {
                throw new Error(signupData.description || signupData.message || 'Signup failed')
            }

            // Step 2: get access token via ROPG
            const result = await loginWithPassword(email, password, {
                email,
                first_name: firstName,
                last_name: lastName,
                profile_picture: null,
                role,
            })
            setAuth(result.access_token, result.role)
            onClose()
            if (result.is_new_user) {
                navigate('/survey', { state: { role: result.role } })
            } else {
                navigate(getDashboardRoute(result.role))
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // --- Google (redirect only) ---
    const handleGoogleLogin = () => {
        sessionStorage.setItem('pendingAuth', 'true')
        loginWithRedirect({ authorizationParams: { prompt: 'login', connection: 'google-oauth2' } })
    }

    return (
        <div className={`modal-container ${isOpen ? 'open' : ''}`}>
            <div className={`modal-content ${isOpen ? 'open' : ''}`}>

                {/* ── Login view ── */}
                <div className="login" style={loginStyle}>
                    <MdCancel className="cancel" onClick={onClose} />
                    <div className="page-title">
                        <h1>LOG <span className="accent">IN</span></h1>
                    </div>
                    <div className="signup-form-section">
                        <form className="signup-form-container" onSubmit={handleLoginSubmit}>
                            {error && view === 'login' && <p className="feedback-msg error" style={{ marginBottom: '0.5rem' }}>{error}</p>}

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

                            <button type="submit" className="signup-btn" disabled={loading}>
                                {loading ? 'LOGGING IN...' : 'LOG IN'}
                            </button>

                            <div className="signup-divider">
                                <div className="signup-divider-line"></div>
                                <span className="signup-divider-text">OR LOG IN WITH</span>
                                <div className="signup-divider-line"></div>
                            </div>

                            <button type="button" className="google-btn" onClick={handleGoogleLogin}>
                                <GoogleIcon /> LOG IN WITH GOOGLE
                            </button>

                            <div className="login-link">
                                Don't have an account?{' '}
                                <a href="#" onClick={(e) => { e.preventDefault(); setError(null); setView('signup') }}>
                                    Sign up now
                                </a>
                            </div>
                        </form>
                    </div>
                </div>

                {/* ── Signup view ── */}
                <div className="registration" style={registrationStyle}>
                    <MdCancel className="cancel" onClick={onClose} />
                    <div className="page-title">
                        <h1>CREATE <span className="accent">ACCOUNT</span></h1>
                    </div>
                    <div className="signup-form-section">
                        <form className="signup-form-container" onSubmit={handleSignupSubmit}>
                            {error && view === 'signup' && <p className="feedback-msg error" style={{ marginBottom: '0.5rem' }}>{error}</p>}

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
                                    <div className={`role-option ${role === 'client' ? 'selected' : ''}`} onClick={() => setRole('client')}>CLIENT</div>
                                    <div className={`role-option ${role === 'coach' ? 'selected' : ''}`} onClick={() => setRole('coach')}>COACH</div>
                                </div>
                            </div>

                            <button type="submit" className="signup-btn" disabled={loading}>
                                {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
                            </button>

                            <div className="signup-divider">
                                <div className="signup-divider-line"></div>
                                <span className="signup-divider-text">OR SIGN UP WITH</span>
                                <div className="signup-divider-line"></div>
                            </div>

                            <button type="button" className="google-btn" onClick={handleGoogleLogin}>
                                <GoogleIcon /> SIGN UP WITH GOOGLE
                            </button>

                            <div className="login-link">
                                Already have an account?{' '}
                                <a href="#" onClick={(e) => { e.preventDefault(); setError(null); setView('login') }}>
                                    Log in
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
