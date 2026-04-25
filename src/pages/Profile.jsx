import React, { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Sidebar } from '../components/Sidebar'
import { useCustomAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../utils/apiBaseUrl'
import { resolveMediaUrl } from '../utils/mediaUrl'
import './Pages.css'
import './Profile.css'

const EditIcon = () => (
    <svg viewBox="0 0 24 24" className="edit-icon" aria-hidden="true">
        <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l9.06-9.06.92.92L5.92 19.58zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
    </svg>
)

const formatDate = (value) => {
    if (!value) return 'Not set'
    return new Date(value).toLocaleDateString()
}

const formatWeight = (grams) => {
    if (grams === null || grams === undefined) return 'Not set'
    return `${Math.round((grams / 453.592) * 10) / 10} lb`
}

export const Profile = () => {
    const { getAccessTokenSilently, isAuthenticated, user } = useAuth0()
    const { customAuth, setProfilePicture } = useCustomAuth()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState('')
    const [saveError, setSaveError] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [editingField, setEditingField] = useState(null)
    const [nameDraft, setNameDraft] = useState('')
    const [goalWeightDraft, setGoalWeightDraft] = useState('')
    const [bioDraft, setBioDraft] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)
    const [updateError, setUpdateError] = useState('')

    useEffect(() => {
	    return () => {
	        if (previewUrl) {
	            URL.revokeObjectURL(previewUrl)
	        }
	    }
    }, [previewUrl])

    useEffect(() => {
        const syncBackendUser = async (token) => {
            if (!isAuthenticated || !user) {
                return { ok: false, detail: 'Missing authenticated Auth0 user profile.' }
            }

            const syncResponse = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email: user?.email || null,
                    first_name: user?.given_name || user?.name || null,
                    last_name: user?.family_name || null,
                    profile_picture: user?.picture || null,
                    role: 'client',
                }),
            })

            const syncBody = await syncResponse.json().catch(() => ({}))
            return {
                ok: syncResponse.ok,
                detail: syncBody.detail || syncBody.message || null,
            }
        }

        const loadProfile = async () => {
            try {
                if (isAuthenticated && !user) {
                    return
                }

                let token = null
                if (isAuthenticated) {
                    token = await getAccessTokenSilently({
                        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
                    })
                } else if (customAuth) {
                    token = customAuth
                }

                if (!token) {
                    setError('Log in to view your profile.')
                    return
                }

                if (isAuthenticated) {
                    const syncOk = await syncBackendUser(token)
                    if (!syncOk) {
                        throw new Error('Failed to sync account with backend.')
                    }
                }

                const response = await fetch(`${API_BASE_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                })

                if (response.ok) {
                    const body = await response.json()
                    setProfile(body)
                    setProfilePicture(body.profile_picture || user?.picture || '')
                    return
                }

                const loadErrorBody = await response.json().catch(() => ({}))

                if (response.status === 401 && isAuthenticated) {
                    const syncResult = await syncBackendUser(token)
                    if (!syncResult.ok) {
                        throw new Error(syncResult.detail || loadErrorBody.detail || 'Failed to sync account with backend.')
                    }

                    const retryResponse = await fetch(`${API_BASE_URL}/users/me`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })

                    const retryBody = await retryResponse.json().catch(() => ({}))
                    if (!retryResponse.ok) {
                        throw new Error(retryBody.detail || 'Failed to load user profile.')
                    }

                    setProfile(retryBody)
                    setProfilePicture(retryBody.profile_picture || user?.picture || '')
                    return
                }

                throw new Error(loadErrorBody.detail || 'Failed to load user profile.')
            } catch (loadError) {
                setError(loadError.message || 'Failed to load user profile.')
            } finally {
                setLoading(false)
            }
        }

        loadProfile()
    }, [customAuth, getAccessTokenSilently, isAuthenticated, setProfilePicture, user])

    const clientProfile = profile?.client_profile
    const coachProfile = profile?.coach_profile
    const profileImageUrl = previewUrl || resolveMediaUrl(profile?.profile_picture)

    useEffect(() => {
        if (!profile) return
        setNameDraft(`${profile.first_name || ''} ${profile.last_name || ''}`.trim())
        setGoalWeightDraft(
            clientProfile?.goal_weight !== null && clientProfile?.goal_weight !== undefined
                ? String(Math.round((clientProfile.goal_weight / 453.592) * 10) / 10)
                : ''
        )
        setBioDraft(coachProfile?.bio || '')
    }, [profile, clientProfile?.goal_weight, coachProfile?.bio])

    const getAuthToken = async () => {
        if (isAuthenticated) {
            return getAccessTokenSilently({
                authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
            })
        }
        return customAuth
    }

    const saveField = async (field) => {
        try {
            setIsUpdating(true)
            setUpdateError('')

            const token = await getAuthToken()
            if (!token) throw new Error('Log in to update your profile.')

            const payload = {}
            if (field === 'name') {
                const trimmed = nameDraft.trim()
                if (!trimmed) throw new Error('Name cannot be empty.')
                const pieces = trimmed.split(/\s+/)
                payload.first_name = pieces[0]
                payload.last_name = pieces.length > 1 ? pieces.slice(1).join(' ') : ''
            }
            if (field === 'goal_weight') {
                const parsed = Number(goalWeightDraft)
                if (!Number.isFinite(parsed) || parsed <= 0) {
                    throw new Error('Goal weight must be a positive number.')
                }
                payload.goal_weight_lb = parsed
            }
            if (field === 'bio') {
                payload.bio = bioDraft
            }

            const response = await fetch(`${API_BASE_URL}/users/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })

            const body = await response.json().catch(() => ({}))
            if (!response.ok) {
                throw new Error(body.detail || 'Failed to update profile.')
            }

            setProfile(body)
            setEditingField(null)
        } catch (updateFieldError) {
            setUpdateError(updateFieldError.message || 'Failed to update profile.')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleFileChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) {
            return
        }

        if (!file.type.startsWith('image/')) {
            setSaveError('Please choose an image file.')
            event.target.value = ''
            return
        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
        }

        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(file))
        setSaveError('')
        event.target.value = ''
    }

    const handleSaveProfilePicture = async () => {
        if (!selectedFile) {
            return
        }

        try {
            setIsSaving(true)
            setSaveError('')

            let token = null
            if (isAuthenticated) {
                token = await getAccessTokenSilently({
                    authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
                })
            } else if (customAuth) {
                token = customAuth
            }

            if (!token) {
                throw new Error('Log in to update your profile picture.')
            }

            const formData = new FormData()
            formData.append('profile_picture', selectedFile)

            const response = await fetch(`${API_BASE_URL}/users/me/profile-picture`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            })

            const body = await response.json().catch(() => ({}))
            if (!response.ok) {
                throw new Error(body.detail || 'Failed to save profile picture.')
            }

            setProfile(body)
            setProfilePicture(body.profile_picture || user?.picture || '')
            setSelectedFile(null)
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
            setPreviewUrl('')
        } catch (saveError) {
            setSaveError(saveError.message || 'Failed to save profile picture.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="profile-page-content">
                <div className="page-heading">
                    <div className="h2">
                        <span className="text-black">USER </span>
                        <span className="text-purple">PROFILE</span>
                    </div>
                </div>

                <div className="dashboard-homepage-container">
                    {loading && <p className="stat-descriptor">Loading profile...</p>}
                    {error && <p className="stat-descriptor">{error}</p>}

                    {profile && (
                        <div className="profile-grid">
                            <section className="profile-panel">
                                <div className="dashboard-heading">Account Details</div>
                                <div className="profile-summary-row">
                                    <label className="profile-avatar-upload">
                                        <input type="file" accept="image/*" className="profile-avatar-input" onChange={handleFileChange} />
                                        <div className="profile-avatar-large">
                                            {profileImageUrl ? (
                                                <img src={profileImageUrl} alt="Profile" className="profile-avatar-image" />
                                            ) : (
                                                <span>{(profile.first_name?.[0] || profile.email?.[0] || 'U').toUpperCase()}</span>
                                            )}
                                            <div className="profile-avatar-overlay">Change photo</div>
                                        </div>
                                    </label>
                                    <div className="profile-summary-copy">
                                        <div className="profile-editable-row">
                                            {editingField === 'name' ? (
                                                <div className="profile-edit-inline">
                                                    <input
                                                        className="profile-edit-input"
                                                        value={nameDraft}
                                                        onChange={(event) => setNameDraft(event.target.value)}
                                                        placeholder="Full name"
                                                    />
                                                    <div className="profile-edit-actions">
                                                        <button type="button" className="profile-inline-btn" onClick={() => saveField('name')} disabled={isUpdating}>Save</button>
                                                        <button type="button" className="profile-inline-btn ghost" onClick={() => setEditingField(null)} disabled={isUpdating}>Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="stat">{`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unnamed User'}</div>
                                                    <button type="button" className="profile-edit-trigger" onClick={() => { setUpdateError(''); setEditingField('name') }} aria-label="Edit name">
                                                        <EditIcon />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        <div className="stat-descriptor">{profile.email}</div>
                                        <div className="profile-photo-actions">
                                            <button
                                                type="button"
                                                className="profile-save-button"
                                                disabled={!selectedFile || isSaving}
                                                onClick={handleSaveProfilePicture}
                                            >
                                                {isSaving ? 'Saving...' : 'Save photo'}
                                            </button>
                                        </div>
                                        {saveError && <div className="stat-descriptor">{saveError}</div>}
                                        {updateError && <div className="stat-descriptor">{updateError}</div>}
                                    </div>
                                </div>
                                <div className="dashboard-list-container">
                                    <div className="dashboard-list-contents">
                                        <div className="stat-heading">Role</div>
                                        <div className="dashboard-list">{profile.role}</div>
                                    </div>
                                    <div className="dashboard-list-contents">
                                        <div className="stat-heading">Joined</div>
                                        <div className="dashboard-list">{formatDate(profile.created_at)}</div>
                                    </div>
                                    <div className="dashboard-list-contents">
                                        <div className="stat-heading">Last Updated</div>
                                        <div className="dashboard-list">{formatDate(profile.last_updated)}</div>
                                    </div>
                                </div>
                            </section>

                            {clientProfile && (
                                <section className="profile-panel">
                                    <div className="dashboard-heading">Client Details</div>
                                    <div className="dashboard-list-container">
                                        <div className="dashboard-list-contents"><div className="stat-heading">Age</div><div className="dashboard-list">{clientProfile.age ?? 'Not set'}</div></div>
                                        <div className="dashboard-list-contents"><div className="stat-heading">Height</div><div className="dashboard-list">{clientProfile.height ? `${clientProfile.height} cm` : 'Not set'}</div></div>
                                        <div className="dashboard-list-contents"><div className="stat-heading">Current Weight</div><div className="dashboard-list">{formatWeight(clientProfile.weight)}</div></div>
                                        <div className="dashboard-list-contents">
                                            <div className="stat-heading">Goal Weight</div>
                                            <div className="profile-editable-row profile-editable-row-inline">
                                                {editingField === 'goal_weight' ? (
                                                    <div className="profile-edit-inline">
                                                        <input
                                                            className="profile-edit-input"
                                                            value={goalWeightDraft}
                                                            onChange={(event) => setGoalWeightDraft(event.target.value)}
                                                            placeholder="Goal weight (lb)"
                                                        />
                                                        <div className="profile-edit-actions">
                                                            <button type="button" className="profile-inline-btn" onClick={() => saveField('goal_weight')} disabled={isUpdating}>Save</button>
                                                            <button type="button" className="profile-inline-btn ghost" onClick={() => setEditingField(null)} disabled={isUpdating}>Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button type="button" className="profile-edit-trigger" onClick={() => { setUpdateError(''); setEditingField('goal_weight') }} aria-label="Edit goal weight">
                                                            <EditIcon />
                                                        </button>
                                                        <div className="dashboard-list">{formatWeight(clientProfile.goal_weight)}</div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="dashboard-list-contents"><div className="stat-heading">Sex</div><div className="dashboard-list">{clientProfile.sex || 'Not set'}</div></div>
                                        <div className="dashboard-list-contents"><div className="stat-heading">Weekly Streak</div><div className="dashboard-list">{clientProfile.weekly_streak}</div></div>
                                    </div>
                                    <div>
                                        <div className="stat-heading">Goals</div>
                                        <div className="profile-tag-list">
                                            {clientProfile.goals.length > 0 ? clientProfile.goals.map((goal) => (
                                                <span key={goal} className="profile-tag">{goal}</span>
                                            )) : <span className="stat-descriptor">No goals set.</span>}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {coachProfile && (
                                <section className="profile-panel">
                                    <div className="dashboard-heading">Coach Details</div>
                                    <div className="dashboard-list-container">
                                        <div className="dashboard-list-contents"><div className="stat-heading">Status</div><div className="dashboard-list">{coachProfile.status || 'Not set'}</div></div>
                                        <div className="dashboard-list-contents"><div className="stat-heading">Gender</div><div className="dashboard-list">{coachProfile.gender || 'Not set'}</div></div>
                                        <div className="dashboard-list-contents"><div className="stat-heading">Hourly Rate</div><div className="dashboard-list">${coachProfile.hourly_rate.toFixed(2)}</div></div>
                                        <div className="dashboard-list-contents"><div className="stat-heading">Experience</div><div className="dashboard-list">{coachProfile.years_of_experience ?? 'Not set'}</div></div>
                                        <div className="dashboard-list-contents"><div className="stat-heading">Max Clients</div><div className="dashboard-list">{coachProfile.max_clients ?? 'Not set'}</div></div>
                                        <div className="dashboard-list-contents"><div className="stat-heading">Accepting Clients</div><div className="dashboard-list">{coachProfile.accepting_clients ? 'Yes' : 'No'}</div></div>
                                        <div className="dashboard-list-contents"><div className="stat-heading">Services</div><div className="dashboard-list">{[coachProfile.is_trainer && 'Trainer', coachProfile.is_nutritionist && 'Nutritionist'].filter(Boolean).join(', ') || 'Coach'}</div></div>
                                    </div>
                                    <div>
                                        <div className="stat-heading">Bio</div>
                                        <div className="profile-editable-row">
                                            {editingField === 'bio' ? (
                                                <div className="profile-edit-inline bio">
                                                    <textarea
                                                        className="profile-edit-input profile-edit-textarea"
                                                        value={bioDraft}
                                                        onChange={(event) => setBioDraft(event.target.value)}
                                                        placeholder="Tell clients about yourself"
                                                    />
                                                    <div className="profile-edit-actions">
                                                        <button type="button" className="profile-inline-btn" onClick={() => saveField('bio')} disabled={isUpdating}>Save</button>
                                                        <button type="button" className="profile-inline-btn ghost" onClick={() => setEditingField(null)} disabled={isUpdating}>Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="stat-descriptor">{coachProfile.bio || 'No bio added yet.'}</div>
                                                    <button type="button" className="profile-edit-trigger" onClick={() => { setUpdateError(''); setEditingField('bio') }} aria-label="Edit bio">
                                                        <EditIcon />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
