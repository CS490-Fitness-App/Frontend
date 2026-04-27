import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useCustomAuth } from '../context/AuthContext';
import './AdminDashboard.css';
import './ClientDashboard.css';
import { API_BASE_URL } from '../utils/apiBaseUrl';

const FINANCIAL_PERIODS = [
    { value: 'all', label: 'All Time' },
    { value: 'this_month', label: 'This Month' },
    { value: 'this_year', label: 'This Year' },
    { value: 'last_90_days', label: 'Last 90 Days' },
];

const formatCurrency = (value) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(value || 0);

export const AdminDashboard = () => {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    const { customAuth } = useCustomAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [coaches, setCoaches] = useState([]);
    const [coachLoading, setCoachLoading] = useState(true);
    const [coachError, setCoachError] = useState('');
    const [coachActionId, setCoachActionId] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [exerciseLoading, setExerciseLoading] = useState(false);
    const [exerciseError, setExerciseError] = useState('');
    const [exerciseActionId, setExerciseActionId] = useState(null);
    const [exerciseMeta, setExerciseMeta] = useState({ categories: [], experience_levels: [], muscle_groups: [] });
    const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
    const [exerciseFormMode, setExerciseFormMode] = useState('add');
    const [exerciseForm, setExerciseForm] = useState({
        exercise_id: null,
        name: '',
        category_id: '',
        experience_level_id: '',
        equipment: '',
        instructions: '',
        tips: '',
        image_url: '',
        video_url: '',
        muscle_group_ids: [],
    });

    const [coachSearch, setCoachSearch] = useState('');
    const [exerciseSearch, setExerciseSearch] = useState('');
    const [financialPeriod, setFinancialPeriod] = useState('all');
    const [financialYear, setFinancialYear] = useState('');
    const [financialSearch, setFinancialSearch] = useState('');
    const [financialSummary, setFinancialSummary] = useState(null);
    const [financialLoading, setFinancialLoading] = useState(false);
    const [financialError, setFinancialError] = useState('');

    const getToken = async () => {
        if (isAuthenticated) {
            return getAccessTokenSilently({
                authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
            });
        }
        return customAuth || null;
    };

    const fetchExercises = async () => {
        setExerciseLoading(true)
        setExerciseError('')
        try {
            const res = await fetch(`${API_BASE_URL}/exercises`)
            const data = await res.json().catch(() => [])
            if (!res.ok) throw new Error(data.detail || 'Failed to load exercises')
            setExercises(data)
        } catch (err) {
            setExerciseError(err.message || 'Failed to load exercises')
        } finally {
            setExerciseLoading(false)
        }
    }

    const fetchCoaches = async () => {
        setCoachLoading(true);
        setCoachError('');
        try {
            const token = await getToken();
            if (!token) {
                setCoachError('Log in as an admin to view coach applications.');
                setCoachLoading(false);
                return;
            }
            const res = await fetch(`${API_BASE_URL}/admin/coaches`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => ([]));
            if (!res.ok) {
                throw new Error(data.detail || 'Failed to load coach applications');
            }
            setCoaches(data);
        } catch (err) {
            setCoachError(err.message || 'Failed to load coach applications');
        } finally {
            setCoachLoading(false);
        }
    };

    useEffect(() => {
        fetchCoaches();
    }, [isAuthenticated, customAuth]);

    const fetchExerciseMeta = async () => {
        const token = await getToken();
        if (!token) {
            throw new Error('Log in as an admin to manage exercises.');
        }
        const res = await fetch(`${API_BASE_URL}/exercises/meta/options`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.detail || 'Failed to load exercise metadata');
        }
        setExerciseMeta(data);
        return data;
    };

    useEffect(() => {
        if (activeTab === 1) {
            fetchExercises();
        }
    }, [activeTab, isAuthenticated, customAuth]);

    const fetchFinancialSummary = async () => {
        setFinancialLoading(true);
        setFinancialError('');
        try {
            const token = await getToken();
            if (!token) {
                setFinancialError('Log in as an admin to view financial tracking.');
                setFinancialLoading(false);
                return;
            }

            const params = new URLSearchParams({ period: financialPeriod });
            if (financialYear.trim()) params.set('year', financialYear.trim());
            if (financialSearch.trim()) params.set('q', financialSearch.trim());

            const res = await fetch(`${API_BASE_URL}/admin/financial-summary?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.detail || 'Failed to load financial data');
            }
            setFinancialSummary(data);
        } catch (err) {
            setFinancialError(err.message || 'Failed to load financial data');
            setFinancialSummary(null);
        } finally {
            setFinancialLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 2) {
            fetchFinancialSummary();
        }
    }, [activeTab, financialPeriod, financialYear, financialSearch, isAuthenticated, customAuth]);

    const updateCoachStatus = async (coachId, action) => {
        setCoachActionId(coachId);
        setCoachError('');
        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Log in as an admin to manage coach applications.');
            }
            const res = await fetch(`${API_BASE_URL}/admin/coaches/${coachId}/${action}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.detail || `Failed to ${action} coach application`);
            }
            setCoaches((current) =>
                current.map((coach) =>
                    coach.coach_id === coachId
                        ? { ...coach, status: data.status, active: data.status === 'Active', accepting_clients: data.status === 'Active' }
                        : coach
                )
            );
        } catch (err) {
            setCoachError(err.message || `Failed to ${action} coach application`);
        } finally {
            setCoachActionId(null);
        }
    };

    const handleApprove = (coachId) => updateCoachStatus(coachId, 'approve');
    const handleReject = (coachId) => updateCoachStatus(coachId, 'reject');
    const handleSuspend = (coachId) => updateCoachStatus(coachId, 'suspend');
    const handleReactivate = (coachId) => updateCoachStatus(coachId, 'reactivate');

    const resetExerciseForm = () => {
        setExerciseForm({
            exercise_id: null,
            name: '',
            category_id: '',
            experience_level_id: '',
            equipment: '',
            instructions: '',
            tips: '',
            image_url: '',
            video_url: '',
            muscle_group_ids: [],
        });
    };

    const openAddExerciseModal = async () => {
        setExerciseError('');
        if (exerciseMeta.categories.length === 0) {
            try {
                await fetchExerciseMeta();
            } catch (err) {
                setExerciseError(err.message || 'Failed to load exercise metadata');
                return;
            }
        }
        setExerciseFormMode('add');
        resetExerciseForm();
        setIsExerciseModalOpen(true);
    };

    const openEditExerciseModal = async (exerciseId) => {
        setExerciseError('');
        setExerciseActionId(exerciseId);
        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Log in as an admin to manage exercises.');
            }
            if (exerciseMeta.categories.length === 0) {
                await fetchExerciseMeta();
            }
            const res = await fetch(`${API_BASE_URL}/exercises/${exerciseId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.detail || 'Failed to load exercise details');
            }
            setExerciseFormMode('edit');
            setExerciseForm({
                exercise_id: data.exercise_id,
                name: data.name || '',
                category_id: String(data.category_id ?? ''),
                experience_level_id: data.experience_level_id ? String(data.experience_level_id) : '',
                equipment: data.equipment || '',
                instructions: data.instructions || '',
                tips: data.tips || '',
                image_url: data.image_url || '',
                video_url: data.video_url || '',
                muscle_group_ids: data.muscle_group_ids || [],
            });
            setIsExerciseModalOpen(true);
        } catch (err) {
            setExerciseError(err.message || 'Failed to load exercise details');
        } finally {
            setExerciseActionId(null);
        }
    };

    const closeExerciseModal = () => {
        setIsExerciseModalOpen(false);
        resetExerciseForm();
    };

    const handleExerciseInputChange = (field, value) => {
        setExerciseForm((current) => ({ ...current, [field]: value }));
    };

    const toggleMuscleGroup = (muscleGroupId) => {
        setExerciseForm((current) => ({
            ...current,
            muscle_group_ids: current.muscle_group_ids.includes(muscleGroupId)
                ? current.muscle_group_ids.filter((id) => id !== muscleGroupId)
                : [...current.muscle_group_ids, muscleGroupId],
        }));
    };

    const handleDeleteExercise = async (exerciseId) => {
        if (!window.confirm('Delete this exercise from the inventory?')) return;
        setExerciseActionId(exerciseId);
        setExerciseError('');
        try {
            const token = await getToken();
            if (!token) throw new Error('Log in as an admin to manage exercises.');
            const res = await fetch(`${API_BASE_URL}/exercises/${exerciseId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.detail || 'Failed to delete exercise');
            }
            setExercises((current) => current.filter((exercise) => exercise.exercise_id !== exerciseId));
        } catch (err) {
            setExerciseError(err.message || 'Failed to delete exercise');
        } finally {
            setExerciseActionId(null);
        }
    };

    const handleEditExercise = (exerciseId) => openEditExerciseModal(exerciseId);

    const handleExerciseSubmit = async (e) => {
        e.preventDefault();
        setExerciseActionId(exerciseForm.exercise_id || -1);
        setExerciseError('');
        try {
            const token = await getToken();
            if (!token) throw new Error('Log in as an admin to manage exercises.');
            if (!exerciseForm.name.trim()) throw new Error('Exercise name is required');
            if (!exerciseForm.category_id) throw new Error('Exercise category is required');
            const payload = {
                name: exerciseForm.name.trim(),
                category_id: Number(exerciseForm.category_id),
                experience_level_id: exerciseForm.experience_level_id ? Number(exerciseForm.experience_level_id) : null,
                equipment: exerciseForm.equipment.trim() || null,
                instructions: exerciseForm.instructions.trim() || null,
                tips: exerciseForm.tips.trim() || null,
                image_url: exerciseForm.image_url.trim() || null,
                video_url: exerciseForm.video_url.trim() || null,
                muscle_group_ids: exerciseForm.muscle_group_ids,
            };
            const isEdit = exerciseFormMode === 'edit' && exerciseForm.exercise_id;
            const endpoint = isEdit ? `${API_BASE_URL}/exercises/${exerciseForm.exercise_id}` : `${API_BASE_URL}/exercises`;
            const res = await fetch(endpoint, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.detail || `Failed to ${isEdit ? 'update' : 'create'} exercise`);
            }
            setExercises((current) => (
                isEdit
                    ? current.map((exercise) => exercise.exercise_id === data.exercise_id ? data : exercise)
                    : [data, ...current]
            ));
            closeExerciseModal();
        } catch (err) {
            setExerciseError(err.message || 'Failed to save exercise');
        } finally {
            setExerciseActionId(null);
        }
    };

    const filteredCoaches = coaches.filter((c) =>
        `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase().includes(coachSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(coachSearch.toLowerCase())
    );

    const filteredExercises = exercises.filter((exercise) =>
        exercise.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
        (exercise.muscle_groups || []).join(' / ').toLowerCase().includes(exerciseSearch.toLowerCase())
    );

    const getStatusClass = (status) => {
        if (status === 'Active' || status === 'Approved') return 'status-approved';
        if (status === 'Pending') return 'status-pending';
        if (status === 'Suspended') return 'status-suspended';
        return 'status-rejected';
    };

    const financialChart = financialSummary?.chart || [];
    const maxChartRevenue = Math.max(...financialChart.map((point) => point.revenue), 0);
    const averageChartRevenue = financialChart.length
        ? financialChart.reduce((total, point) => total + point.revenue, 0) / financialChart.length
        : 0;
    const averageLineBottom = maxChartRevenue
        ? Math.min((averageChartRevenue / maxChartRevenue) * 210, 210)
        : 0;
    const hasFinancialTransactions = Boolean(financialSummary?.recent_transactions?.length);

    return (
        <div>
            <div>
                    <div className="page-heading">
                        <div className="h2">
                            <span className="text-black">ADMIN </span>
                            <span className="text-purple">PANEL</span>
                        </div>
                    </div>
                    <div className="admin-section">
                        <div className="dashboard">
                            <div className="section-quick-stats">
                                <div className="quick-stat-card"><div className="stat-heading">Total Users</div><div className="stat">847</div></div>
                                <div className="quick-stat-card"><div className="stat-heading">Active Coaches</div><div className="stat">{coaches.filter((coach) => coach.status === 'Active').length}</div></div>
                                <div className="quick-stat-card"><div className="stat-heading">Pending Approvals</div><div className="stat">{coaches.filter((coach) => coach.status === 'Pending').length} <span className="pending-dot" style={{ background: '#F5A623' }}></span></div></div>
                                <div className="quick-stat-card" onClick={() => setActiveTab(2)}><div className="stat-heading">Revenue This Month</div><div className="stat">$18,420</div></div>
                            </div>
                            <div className="tabs">
                                {['COACH MANAGEMENT', 'EXERCISE INVENTORY', 'FINANCIAL TRACKING', 'USER ENGAGEMENT'].map((tab, i) => (
                                    <div key={i} className={`tab ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>{tab}</div>
                                ))}
                            </div>
                            {activeTab === 0 && (
                                <div className="tab-content">
                                    <div className="section-header">
                                        <div className="admin-section-title">Coach Applications & Accounts</div>
                                        <div className="admin-search-bar">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6BA0" strokeWidth="2">
                                                <circle cx="11" cy="11" r="8" />
                                                <path d="m21 21-4.35-4.35" />
                                            </svg>
                                            <input type="text" placeholder="SEARCH COACHES..." value={coachSearch} onChange={(e) => setCoachSearch(e.target.value)} />
                                        </div>
                                    </div>
                                    {coachError && <p className="feedback-msg error">{coachError}</p>}
                                    <table className="admin-table">
                                        <thead>
                                            <tr><th>Coach</th><th>Email</th><th>Specialization</th><th>Status</th><th>Active</th><th>Actions</th></tr>
                                        </thead>
                                        <tbody>
                                            {coachLoading ? (
                                                <tr><td colSpan="6">Loading coach applications...</td></tr>
                                            ) : filteredCoaches.length === 0 ? (
                                                <tr><td colSpan="6">No coach applications found.</td></tr>
                                            ) : filteredCoaches.map((coach) => (
                                                <tr key={coach.coach_id}>
                                                    <td><strong>{coach.first_name} {coach.last_name}</strong></td>
                                                    <td>{coach.email}</td>
                                                    <td>{coach.specialization}</td>
                                                    <td><span className={`status-badge ${getStatusClass(coach.status)}`}>{coach.status}</span></td>
                                                    <td><label className="toggle-switch"><input type="checkbox" checked={coach.active} readOnly disabled /><span className="toggle-slider"></span></label></td>
                                                    <td>
                                                        {coach.status === 'Pending' ? (
                                                            <div className="actions-cell">
                                                                <button className="btn-sm btn-green" disabled={coachActionId === coach.coach_id} onClick={() => handleApprove(coach.coach_id)}>{coachActionId === coach.coach_id ? 'WORKING...' : 'APPROVE'}</button>
                                                                <button className="btn-sm btn-red-outline" disabled={coachActionId === coach.coach_id} onClick={() => handleReject(coach.coach_id)}>{coachActionId === coach.coach_id ? 'WORKING...' : 'REJECT'}</button>
                                                            </div>
                                                        ) : coach.status === 'Active' ? (
                                                            <button className="btn-sm btn-warn-outline" disabled={coachActionId === coach.coach_id} onClick={() => handleSuspend(coach.coach_id)}>{coachActionId === coach.coach_id ? 'WORKING...' : 'SUSPEND'}</button>
                                                        ) : coach.status === 'Suspended' ? (
                                                            <button className="btn-sm btn-green" disabled={coachActionId === coach.coach_id} onClick={() => handleReactivate(coach.coach_id)}>{coachActionId === coach.coach_id ? 'WORKING...' : 'REACTIVATE'}</button>
                                                        ) : (
                                                            <button className="btn-sm btn-outline-sm">VIEW</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {activeTab === 1 && (
                                <div className="tab-content">
                                    {exerciseLoading && <p>Loading exercises...</p>}
                                    {exerciseError && <p className="feedback-msg error">{exerciseError}</p>}
                                    <div className="section-header">
                                        <div className="admin-search-bar">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6BA0" strokeWidth="2">
                                                <circle cx="11" cy="11" r="8" />
                                                <path d="m21 21-4.35-4.35" />
                                            </svg>
                                            <input type="text" placeholder="SEARCH EXERCISES..." value={exerciseSearch} onChange={(e) => setExerciseSearch(e.target.value)} />
                                        </div>
                                        <button className="btn-add" onClick={openAddExerciseModal}>+ ADD EXERCISE</button>
                                    </div>
                                    {exerciseError && <p className="feedback-msg error">{exerciseError}</p>}
                                    <table className="admin-table">
                                        <thead>
                                            <tr><th>Exercise Name</th><th>Muscle Group</th><th>Equipment</th><th>Actions</th></tr>
                                        </thead>
                                        <tbody>
                                            {exerciseLoading ? (
                                                <tr><td colSpan="4">Loading exercise inventory...</td></tr>
                                            ) : filteredExercises.length === 0 ? (
                                                <tr><td colSpan="4">No exercises found.</td></tr>
                                            ) : filteredExercises.map((exercise) => (
                                                <tr key={exercise.exercise_id}>
                                                    <td><strong>{exercise.name}</strong></td>
                                                    <td>{(exercise.muscle_groups || []).join(' / ') || 'None'}</td>
                                                    <td>{exercise.equipment || 'None'}</td>
                                                    <td>
                                                        <div className="actions-cell">
                                                            <button className="btn-sm btn-outline-sm" disabled={exerciseActionId === exercise.exercise_id} onClick={() => handleEditExercise(exercise.exercise_id)}>EDIT</button>
                                                            <button className="btn-sm btn-red-outline" disabled={exerciseActionId === exercise.exercise_id} onClick={() => handleDeleteExercise(exercise.exercise_id)}>{exerciseActionId === exercise.exercise_id ? 'WORKING...' : 'DELETE'}</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {isExerciseModalOpen && (
                                        <div className="admin-modal-overlay" onClick={closeExerciseModal}>
                                            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                                                <div className="admin-modal-header">
                                                    <div className="admin-section-title">{exerciseFormMode === 'edit' ? 'Edit Exercise' : 'Add Exercise'}</div>
                                                    <button className="admin-modal-close" onClick={closeExerciseModal}>X</button>
                                                </div>
                                                <form className="admin-exercise-form" onSubmit={handleExerciseSubmit}>
                                                    <label>
                                                        Exercise Name
                                                        <input type="text" value={exerciseForm.name} onChange={(e) => handleExerciseInputChange('name', e.target.value)} required />
                                                    </label>
                                                    <div className="admin-form-row">
                                                        <label>
                                                            Category
                                                            <select value={exerciseForm.category_id} onChange={(e) => handleExerciseInputChange('category_id', e.target.value)} required>
                                                                <option value="">Select category</option>
                                                                {exerciseMeta.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                                                            </select>
                                                        </label>
                                                        <label>
                                                            Experience Level
                                                            <select value={exerciseForm.experience_level_id} onChange={(e) => handleExerciseInputChange('experience_level_id', e.target.value)}>
                                                                <option value="">Not set</option>
                                                                {exerciseMeta.experience_levels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}
                                                            </select>
                                                        </label>
                                                    </div>
                                                    <label>
                                                        Equipment
                                                        <input type="text" value={exerciseForm.equipment} onChange={(e) => handleExerciseInputChange('equipment', e.target.value)} />
                                                    </label>
                                                    <div className="admin-form-row">
                                                        <label>
                                                            Image URL
                                                            <input type="url" value={exerciseForm.image_url} onChange={(e) => handleExerciseInputChange('image_url', e.target.value)} />
                                                        </label>
                                                        <label>
                                                            Video URL
                                                            <input type="url" value={exerciseForm.video_url} onChange={(e) => handleExerciseInputChange('video_url', e.target.value)} />
                                                        </label>
                                                    </div>
                                                    <label>
                                                        Instructions
                                                        <textarea value={exerciseForm.instructions} onChange={(e) => handleExerciseInputChange('instructions', e.target.value)} rows="4" />
                                                    </label>
                                                    <label>
                                                        Tips
                                                        <textarea value={exerciseForm.tips} onChange={(e) => handleExerciseInputChange('tips', e.target.value)} rows="3" />
                                                    </label>
                                                    <div>
                                                        <div className="admin-form-label">Muscle Groups</div>
                                                        <div className="admin-checkbox-grid">
                                                            {exerciseMeta.muscle_groups.map((muscleGroup) => (
                                                                <label key={muscleGroup.id} className="admin-checkbox-item">
                                                                    <input type="checkbox" checked={exerciseForm.muscle_group_ids.includes(muscleGroup.id)} onChange={() => toggleMuscleGroup(muscleGroup.id)} />
                                                                    <span>{muscleGroup.name}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="admin-modal-actions">
                                                        <button type="button" className="btn-sm btn-outline-sm" onClick={closeExerciseModal}>CANCEL</button>
                                                        <button type="submit" className="btn-sm btn-green" disabled={exerciseActionId !== null}>{exerciseActionId !== null ? 'SAVING...' : exerciseFormMode === 'edit' ? 'SAVE CHANGES' : 'CREATE EXERCISE'}</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === 2 && (
                                <div className="tab-content">
                                    <div className="section-header">
                                        <div className="admin-section-title">Financial Tracking</div>
                                        <div className="financial-period-group">
                                            <span className="financial-filter-label">Time Range</span>
                                            {FINANCIAL_PERIODS.map((period) => (
                                                <button
                                                    key={period.value}
                                                    type="button"
                                                    className={`financial-filter ${financialPeriod === period.value ? 'active' : ''}`}
                                                    onClick={() => setFinancialPeriod(period.value)}
                                                >
                                                    {period.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="financial-search-panel">
                                        <div className="admin-search-bar financial-search-bar">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6BA0" strokeWidth="2">
                                                <circle cx="11" cy="11" r="8" />
                                                <path d="m21 21-4.35-4.35" />
                                            </svg>
                                            <input
                                                type="text"
                                                placeholder="SEARCH CLIENT, COACH, OR PAYMENT ID..."
                                                value={financialSearch}
                                                onChange={(e) => setFinancialSearch(e.target.value)}
                                            />
                                        </div>
                                        <input
                                            className="financial-year-input"
                                            type="number"
                                            placeholder="YEAR"
                                            value={financialYear}
                                            onWheel={(e) => e.currentTarget.blur()}
                                            onChange={(e) => setFinancialYear(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="financial-filter"
                                            onClick={() => {
                                                setFinancialPeriod('all');
                                                setFinancialYear('');
                                                setFinancialSearch('');
                                            }}
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                    {financialError && <p className="feedback-msg error">{financialError}</p>}
                                    <div className="finance-grid">
                                        <div className="finance-card"><div className="stat-label">Total Revenue</div><div className="finance-value">{financialLoading ? 'Loading...' : formatCurrency(financialSummary?.total_revenue)}</div></div>
                                        <div className="finance-card"><div className="stat-label">Transactions</div><div className="finance-value">{financialLoading ? 'Loading...' : financialSummary?.transaction_count ?? 0}</div></div>
                                        <div className="finance-card"><div className="stat-label">Average Per Transaction</div><div className="finance-value">{financialLoading ? 'Loading...' : formatCurrency(financialSummary?.average_transaction)}</div></div>
                                        <div className="finance-card"><div className="stat-label">Platform Earnings</div><div className="finance-value">{financialLoading ? 'Loading...' : formatCurrency(financialSummary?.platform_revenue)}</div></div>
                                        <div className="finance-card"><div className="stat-label">Coach Payouts</div><div className="finance-value">{financialLoading ? 'Loading...' : formatCurrency(financialSummary?.coach_payout_total)}</div></div>
                                        <div className="finance-card"><div className="stat-label">Refunded Amount</div><div className="finance-value">{financialLoading ? 'Loading...' : formatCurrency(financialSummary?.refunded_amount)}</div></div>
                                    </div>
                                    <div className="finance-chart-card">
                                        <div className="finance-chart-header">
                                            <div>
                                                <div className="admin-section-title">Monthly Revenue</div>
                                                <div className="finance-chart-subtitle">Completed payment revenue with average line.</div>
                                            </div>
                                            <div className="finance-chart-average">Avg {formatCurrency(averageChartRevenue)}</div>
                                        </div>
                                        {financialLoading && !financialSummary ? (
                                            <div className="finance-chart-loading">Loading monthly revenue...</div>
                                        ) : financialSummary && !financialSummary.has_transactions ? (
                                            <p className="finance-empty-state">No transactions available for this period.</p>
                                        ) : (
                                            <>
                                                <div className="finance-chart-body">
                                                    <div className="finance-average-line" style={{ bottom: `${averageLineBottom + 82}px` }}></div>
                                                    {financialChart.map((point) => (
                                                        <div key={point.label} className="finance-bar-col">
                                                            <div className="finance-bar-panel">
                                                                <div
                                                                    className={`finance-bar ${point.revenue >= averageChartRevenue ? 'above-average' : 'below-average'}`}
                                                                    title={`${point.label}: ${formatCurrency(point.revenue)} from ${point.transaction_count} transactions`}
                                                                    style={{ height: `${maxChartRevenue ? Math.max((point.revenue / maxChartRevenue) * 210, 12) : 0}px` }}
                                                                ></div>
                                                            </div>
                                                            <div className="bar-label">{point.label}</div>
                                                            <div className="finance-bar-value">{formatCurrency(point.revenue)}</div>
                                                            <div className="finance-bar-count">{point.transaction_count} txns</div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="finance-chart-footer">Average monthly revenue: {formatCurrency(averageChartRevenue)}</div>
                                            </>
                                        )}
                                    </div>
                                    <div className="admin-section-title" style={{ margin: '26px 0 16px' }}>Recent Transactions</div>
                                    {financialLoading ? (
                                        <p className="finance-empty-state">Loading transactions...</p>
                                    ) : hasFinancialTransactions ? (
                                        <table className="admin-table financial-transactions-table">
                                            <thead>
                                                <tr><th>Date</th><th>Client</th><th>Coach</th><th>Amount</th><th>Platform Fee</th><th>Coach Payout</th><th>Status</th></tr>
                                            </thead>
                                            <tbody>
                                                {financialSummary.recent_transactions.map((transaction) => (
                                                    <tr key={transaction.payment_id}>
                                                        <td>{new Date(transaction.payment_date).toLocaleDateString()}</td>
                                                        <td>{transaction.client_name}</td>
                                                        <td>{transaction.coach_name}</td>
                                                        <td>{formatCurrency(transaction.amount)}</td>
                                                        <td>{formatCurrency(transaction.platform_fee)}</td>
                                                        <td>{formatCurrency(transaction.coach_payout_amount)}</td>
                                                        <td><span className={`status-badge status-${transaction.status.toLowerCase()}`}>{transaction.status}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="finance-empty-state">No transactions available for this period.</p>
                                    )}
                                </div>
                            )}
                            {activeTab === 3 && (
                                <div className="tab-content">
                                    <div className="engage-row">
                                        <div className="engage-card">
                                            <div className="stat-label">Daily Active Users (Last 14 Days)</div>
                                            <div className="finance-value" style={{ margin: '8px 0 16px' }}>312</div>
                                            <div className="line-chart">
                                                {[45, 52, 48, 60, 55, 42, 38, 58, 65, 70, 62, 75, 80, 85].map((h, i) => <div key={i} className={`line-bar ${i >= 12 ? 'highlight' : ''}`} style={{ height: `${h}%` }}></div>)}
                                            </div>
                                        </div>
                                        <div className="engage-card">
                                            <div className="stat-label">Workouts Logged This Week</div>
                                            <div className="finance-value" style={{ margin: '8px 0 16px' }}>1,247</div>
                                            <div className="line-chart">
                                                {[30, 65, 80, 70, 85, 55, 25].map((h, i) => <div key={i} className={`line-bar ${i === 5 ? 'highlight' : ''}`} style={{ height: `${h}%` }}></div>)}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px' }}>
                                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <span key={d} className="bar-label">{d}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="footer-spacer"></div>
                    </div>
            </div>
        </div>
    );
};
