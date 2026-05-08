import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useCustomAuth } from '../context/AuthContext';
import './AdminDashboard.css';
import './ClientDashboard.css';
import { API_BASE_URL } from '../utils/apiBaseUrl';
import { resolveMediaUrl } from '../utils/mediaUrl';

const FINANCIAL_PERIODS = [
    { value: 'all', label: 'All Time' },
    { value: 'this_month', label: 'This Month' },
    { value: 'this_year', label: 'This Year' },
    { value: 'last_90_days', label: 'Last 90 Days' },
];

const ENGAGEMENT_PERIODS = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
];

const formatCurrency = (value) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(value || 0);

const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;
const formatWeightLb = (value) => (value === null || value === undefined ? '—' : `${value} lb`);
const formatDateLabel = (value) => (value ? new Date(value).toLocaleDateString() : '—');
const formatDateTimeLabel = (value) => (value ? new Date(value).toLocaleString() : '—');

const getEngagementLabelStep = (count) => {
    if (count <= 14) return 1;
    if (count <= 31) return 3;
    if (count <= 90) return 7;
    return 30;
};

const getMoodToneClass = (label) => {
    const normalized = (label || 'okay').toLowerCase();
    if (normalized === 'amazing' || normalized === 'good') return 'mood-positive';
    if (normalized === 'bad' || normalized === 'awful') return 'mood-negative';
    return 'mood-neutral';
};

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

    const [workouts, setWorkouts] = useState([]);
    const [workoutLoading, setWorkoutLoading] = useState(false);
    const [workoutError, setWorkoutError] = useState('');
    const [workoutActionId, setWorkoutActionId] = useState(null);
    const [workoutSearch, setWorkoutSearch] = useState('');

    const [clients, setClients] = useState([]);
    const [clientLoading, setClientLoading] = useState(false);
    const [clientError, setClientError] = useState('');
    const [clientSearch, setClientSearch] = useState('');
    const [clientActionId, setClientActionId] = useState(null);
    const [clientStatusModal, setClientStatusModal] = useState(null);
    const [clientDeleteModal, setClientDeleteModal] = useState(null);
    const [profileModal, setProfileModal] = useState(null);
    const [reports, setReports] = useState([]);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState('');
    const [reportSearch, setReportSearch] = useState('');
    const [reportActionId, setReportActionId] = useState(null);

    const [coachSearch, setCoachSearch] = useState('');
    const [exerciseSearch, setExerciseSearch] = useState('');
    const [financialPeriod, setFinancialPeriod] = useState('all');
    const [financialYear, setFinancialYear] = useState('');
    const [financialSearch, setFinancialSearch] = useState('');
    const [financialSummary, setFinancialSummary] = useState(null);
    const [financialLoading, setFinancialLoading] = useState(false);
    const [financialError, setFinancialError] = useState('');
    const [adminOverview, setAdminOverview] = useState(null);
    const [adminOverviewError, setAdminOverviewError] = useState('');
    const [engagementSummary, setEngagementSummary] = useState(null);
    const [engagementLoading, setEngagementLoading] = useState(false);
    const [engagementError, setEngagementError] = useState('');
    const [engagementPeriod, setEngagementPeriod] = useState('month');

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

    const fetchAdminOverview = async () => {
        setAdminOverviewError('');
        try {
            const token = await getToken();
            if (!token) {
                setAdminOverview(null);
                return;
            }
            const res = await fetch(`${API_BASE_URL}/admin/overview`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.detail || 'Failed to load admin overview');
            }
            setAdminOverview(data);
        } catch (err) {
            setAdminOverviewError(err.message || 'Failed to load admin overview');
            setAdminOverview(null);
        }
    };

    useEffect(() => {
        fetchAdminOverview();
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
        if (activeTab === 4) {
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
        if (activeTab === 3) {
            fetchFinancialSummary();
        }
    }, [activeTab, financialPeriod, financialYear, financialSearch, isAuthenticated, customAuth]);

    const fetchEngagementSummary = async () => {
        setEngagementLoading(true);
        setEngagementError('');
        try {
            const token = await getToken();
            if (!token) {
                setEngagementError('Log in as an admin to view user engagement.');
                setEngagementLoading(false);
                return;
            }

            const res = await fetch(`${API_BASE_URL}/admin/engagement-summary?period=${engagementPeriod}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.detail || 'Failed to load engagement data');
            }
            setEngagementSummary(data);
        } catch (err) {
            setEngagementError(err.message || 'Failed to load engagement data');
            setEngagementSummary(null);
        } finally {
            setEngagementLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 2) {
            fetchEngagementSummary();
        }
    }, [activeTab, engagementPeriod, isAuthenticated, customAuth]);

    const fetchWorkouts = async () => {
        setWorkoutLoading(true);
        setWorkoutError('');
        try {
            const token = await getToken();
            if (!token) {
                setWorkoutError('Log in as an admin to view workouts.');
                setWorkoutLoading(false);
                return;
            }
            const res = await fetch(`${API_BASE_URL}/workouts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => []);
            if (!res.ok) throw new Error(data.detail || 'Failed to load workouts');
            setWorkouts(data);
        } catch (err) {
            setWorkoutError(err.message || 'Failed to load workouts');
        } finally {
            setWorkoutLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 5) {
            fetchWorkouts();
        }
    }, [activeTab, isAuthenticated, customAuth]);

    const fetchClients = async () => {
        setClientLoading(true);
        setClientError('');
        try {
            const token = await getToken();
            if (!token) {
                setClientError('Log in as an admin to view clients.');
                setClientLoading(false);
                return;
            }
            const res = await fetch(`${API_BASE_URL}/admin/clients`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => []);
            if (!res.ok) throw new Error(data.detail || 'Failed to load clients');
            setClients(data);
        } catch (err) {
            setClientError(err.message || 'Failed to load clients');
        } finally {
            setClientLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 0) {
            fetchClients();
        }
    }, [activeTab, isAuthenticated, customAuth]);

    const fetchReports = async () => {
        setReportLoading(true);
        setReportError('');
        try {
            const token = await getToken();
            if (!token) {
                setReportError('Log in as an admin to review reports.');
                setReportLoading(false);
                return;
            }
            const res = await fetch(`${API_BASE_URL}/admin/reports`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => []);
            if (!res.ok) throw new Error(data.detail || 'Failed to load reports');
            setReports(data);
        } catch (err) {
            setReportError(err.message || 'Failed to load reports');
        } finally {
            setReportLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 6) {
            fetchReports();
        }
    }, [activeTab, isAuthenticated, customAuth]);

    useEffect(() => {
        fetchReports();
    }, [isAuthenticated, customAuth]);

    const handleToggleClientStatus = async (clientId, isActive) => {
        const actionLabel = isActive ? 'deactivate' : 'reactivate';
        setClientActionId(clientId);
        setClientError('');
        try {
            const token = await getToken();
            if (!token) throw new Error('Log in as an admin to manage clients.');
            const res = await fetch(`${API_BASE_URL}/admin/clients/${clientId}/${isActive ? 'deactivate' : 'reactivate'}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.detail || `Failed to ${actionLabel} client`);
            }
            setClients((current) => current.map((client) => (
                client.client_id === clientId
                    ? { ...client, is_active: data.is_active }
                    : client
            )));
            fetchAdminOverview();
        } catch (err) {
            setClientError(err.message || `Failed to ${actionLabel} client`);
        } finally {
            setClientActionId(null);
        }
    };

    const openClientStatusModal = (client) => {
        setClientStatusModal({
            clientId: client.client_id,
            isActive: client.is_active,
            clientName: `${client.first_name || ''} ${client.last_name || ''}`.trim() || client.email,
        });
    };

    const closeClientStatusModal = () => {
        setClientStatusModal(null);
    };

    const confirmClientStatusAction = async () => {
        if (!clientStatusModal) return;
        const { clientId, isActive } = clientStatusModal;
        await handleToggleClientStatus(clientId, isActive);
        setClientStatusModal(null);
    };

    const openClientDeleteModal = (client) => {
        setClientDeleteModal({
            clientId: client.client_id,
            clientName: `${client.first_name || ''} ${client.last_name || ''}`.trim() || client.email,
        });
    };

    const closeClientDeleteModal = () => {
        setClientDeleteModal(null);
    };

    const handleDeleteClient = async (clientId) => {
        setClientActionId(clientId);
        setClientError('');
        try {
            const token = await getToken();
            if (!token) throw new Error('Log in as an admin to manage clients.');
            const res = await fetch(`${API_BASE_URL}/admin/clients/${clientId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.detail || 'Failed to delete client');
            }
            setClients((current) => current.filter((client) => client.client_id !== clientId));
            fetchAdminOverview();
        } catch (err) {
            setClientError(err.message || 'Failed to delete client');
        } finally {
            setClientActionId(null);
        }
    };

    const confirmDeleteClient = async () => {
        if (!clientDeleteModal) return;
        await handleDeleteClient(clientDeleteModal.clientId);
        setClientDeleteModal(null);
    };

    const openProfileModal = async (type, id) => {
        setProfileModal({ type, loading: true, error: '', data: null });
        try {
            const token = await getToken();
            if (!token) throw new Error('Log in as an admin to view profile details.');
            const endpoint = type === 'client'
                ? `${API_BASE_URL}/admin/clients/${id}/profile`
                : `${API_BASE_URL}/admin/coaches/${id}/profile`;
            const res = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.detail || 'Failed to load profile details.');
            }
            setProfileModal({ type, loading: false, error: '', data });
        } catch (err) {
            setProfileModal({ type, loading: false, error: err.message || 'Failed to load profile details.', data: null });
        }
    };

    const closeProfileModal = () => {
        setProfileModal(null);
    };

    const formatClientDeactivationState = (client) => {
        if (client.is_active) {
            return '—';
        }
        if (client.deactivated_by_admin) {
            return 'Admin hold';
        }
        if (client.scheduled_deletion_at) {
            return `Deletes ${new Date(client.scheduled_deletion_at).toLocaleDateString()}`;
        }
        return 'Inactive';
    };

    const getClientDeactivationTooltip = (client) => {
        if (client.is_active) return '';
        if (client.deactivated_by_admin) {
            return client.deactivated_at
                ? `Deactivated by admin on ${new Date(client.deactivated_at).toLocaleString()}`
                : 'Deactivated by admin until manually reactivated or deleted.';
        }
        if (client.scheduled_deletion_at) {
            return `Scheduled deletion: ${new Date(client.scheduled_deletion_at).toLocaleString()}`;
        }
        return 'Account is inactive.';
    };

    const handleUpdateReportStatus = async (reportId, status) => {
        setReportActionId(reportId);
        setReportError('');
        try {
            const token = await getToken();
            if (!token) throw new Error('Log in as an admin to manage reports.');
            const res = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.detail || 'Failed to update report status');
            setReports((current) => current.map((report) => (
                report.report_id === reportId ? data : report
            )));
            fetchAdminOverview();
        } catch (err) {
            setReportError(err.message || 'Failed to update report status');
        } finally {
            setReportActionId(null);
        }
    };

    const handleDeleteWorkout = async (workoutId) => {
        if (!window.confirm('Delete this workout plan? This cannot be undone.')) return;
        setWorkoutActionId(workoutId);
        setWorkoutError('');
        try {
            const token = await getToken();
            if (!token) throw new Error('Log in as an admin to manage workouts.');
            const res = await fetch(`${API_BASE_URL}/workouts/${workoutId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.detail || 'Failed to delete workout');
            }
            setWorkouts((current) => current.filter((w) => w.workout_id !== workoutId));
        } catch (err) {
            setWorkoutError(err.message || 'Failed to delete workout');
        } finally {
            setWorkoutActionId(null);
        }
    };

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
            setReports((current) =>
                current.map((report) =>
                    report.coach_id === coachId
                        ? { ...report, coach_status: data.status }
                        : report
                )
            );
            fetchAdminOverview();
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

    const filteredWorkouts = workouts.filter((w) =>
        (w.name || '').toLowerCase().includes(workoutSearch.toLowerCase())
    );

    const filteredClients = clients.filter((c) => {
        const q = clientSearch.toLowerCase();
        return (
            `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q)
        );
    });

    const filteredReports = reports.filter((report) => {
        const q = reportSearch.toLowerCase();
        return (
            (report.reporter_name || '').toLowerCase().includes(q) ||
            (report.reporter_email || '').toLowerCase().includes(q) ||
            (report.coach_name || '').toLowerCase().includes(q) ||
            (report.coach_email || '').toLowerCase().includes(q) ||
            (report.reason || '').toLowerCase().includes(q) ||
            (report.status || '').toLowerCase().includes(q)
        );
    });

    const getStatusClass = (status) => {
        if (status === 'Active' || status === 'Approved' || status === 'Resolved') return 'status-approved';
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
    const engagementChart = engagementSummary?.chart || [];
    const maxActiveUsers = Math.max(...engagementChart.map((point) => point.active_users), 0);
    const bestActiveUsers = Math.max(...engagementChart.map((point) => point.active_users), 0);
    const bestSurveyRate = Math.max(...engagementChart.map((point) => point.survey_completion_rate), 0);
    const maxSurveyCompletions = Math.max(...engagementChart.map((point) => point.survey_completions), 0);
    const moodBreakdown = engagementSummary?.mood_breakdown || [];
    const activeCoachCount = coaches.length
        ? coaches.filter((coach) => coach.status === 'Active').length
        : (adminOverview?.active_coaches ?? 'â€”');
    const pendingCoachCount = coaches.length
        ? coaches.filter((coach) => coach.status === 'Pending').length
        : (adminOverview?.pending_approvals ?? 'â€”');
    const pendingReportCount = reports.filter((report) => report.status === 'Pending').length;
    const engagementLabelStep = getEngagementLabelStep(engagementChart.length);

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
                                <div className="quick-stat-card admin-click-card" onClick={() => setActiveTab(0)}><div className="stat-heading">Total Users</div><div className="stat">{adminOverview?.total_users ?? '—'}</div></div>
                                <div className="quick-stat-card admin-click-card" onClick={() => setActiveTab(1)}><div className="stat-heading">Active Coaches</div><div className="stat">{activeCoachCount}</div></div>
                                <div className="quick-stat-card admin-click-card" onClick={() => setActiveTab(1)}><div className="stat-heading">Pending Approvals</div><div className="stat">{pendingCoachCount} <span className="pending-dot" style={{ background: '#F5A623' }}></span></div></div>
                                <div className="quick-stat-card admin-click-card" onClick={() => setActiveTab(6)}><div className="stat-heading">Pending Reports</div><div className="stat">{pendingReportCount} <span className="pending-dot" style={{ background: '#EA4335' }}></span></div></div>
                                <div className="quick-stat-card admin-click-card" onClick={() => setActiveTab(3)}><div className="stat-heading">Revenue This Month</div><div className="stat">{adminOverview ? formatCurrency(adminOverview.revenue_this_month) : '—'}</div></div>
                            </div>
                            {adminOverviewError && <p className="feedback-msg error">{adminOverviewError}</p>}
                            <div className="tabs">
                                {['CLIENT MANAGEMENT', 'COACH MANAGEMENT', 'USER ENGAGEMENT', 'FINANCIAL TRACKING', 'EXERCISE INVENTORY', 'WORKOUT INVENTORY', 'REPORTS'].map((tab, i) => (
                                    <div key={i} className={`tab ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>{tab}</div>
                                ))}
                            </div>
                            {activeTab === 1 && (
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
                                                <tr><td colSpan="6"><span className="state-message loading">Loading coach applications...</span></td></tr>
                                            ) : filteredCoaches.length === 0 ? (
                                                <tr><td colSpan="6"><span className="state-message">No coach applications found.</span></td></tr>
                                            ) : filteredCoaches.map((coach) => (
                                                <tr key={coach.coach_id}>
                                                    <td>
                                                        <button type="button" className="admin-profile-trigger" onClick={() => openProfileModal('coach', coach.coach_id)}>
                                                            <strong>{coach.first_name} {coach.last_name}</strong>
                                                        </button>
                                                    </td>
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
                            {activeTab === 4 && (
                                <div className="tab-content">
                                    {exerciseLoading && <p className="state-message loading">Loading exercises...</p>}
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
                                                <tr><td colSpan="4"><span className="state-message">No exercises found.</span></td></tr>
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
                            {activeTab === 3 && (
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
                            {activeTab === 2 && (
                                <div className="tab-content">
                                    <div className="section-header">
                                        <div className="admin-section-title">User Engagement</div>
                                        <div className="financial-period-group">
                                            <span className="financial-filter-label">Time Range</span>
                                            {ENGAGEMENT_PERIODS.map((period) => (
                                                <button
                                                    key={period.value}
                                                    type="button"
                                                    className={`financial-filter ${engagementPeriod === period.value ? 'active' : ''}`}
                                                    onClick={() => setEngagementPeriod(period.value)}
                                                >
                                                    {period.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="engagement-subtitle">
                                        Live usage, survey follow-through, and mood trends for the selected period.
                                    </div>
                                    {engagementError && <p className="feedback-msg error">{engagementError}</p>}
                                    <div className="engagement-metrics-grid">
                                        <div className="finance-card finance-card-soft">
                                            <div className="stat-label">Active Clients Today</div>
                                            <div className="finance-value">{engagementLoading ? 'Loading...' : engagementSummary?.today_active_users ?? 0}</div>
                                        </div>
                                        <div className="finance-card finance-card-soft">
                                            <div className="stat-label">Surveys Completed Today</div>
                                            <div className="finance-value">{engagementLoading ? 'Loading...' : engagementSummary?.today_survey_completions ?? 0}</div>
                                        </div>
                                        <div className="finance-card finance-card-soft">
                                            <div className="stat-label">Avg Daily Active Users</div>
                                            <div className="finance-value">{engagementLoading ? 'Loading...' : engagementSummary?.average_daily_active_users ?? 0}</div>
                                        </div>
                                        <div className="finance-card finance-card-soft">
                                            <div className="stat-label">Avg Survey Completion</div>
                                            <div className="finance-value">{engagementLoading ? 'Loading...' : formatPercent(engagementSummary?.average_survey_completion_rate)}</div>
                                        </div>
                                    </div>
                                    {engagementLoading && !engagementSummary ? (
                                        <p className="finance-empty-state">Loading engagement analytics...</p>
                                    ) : engagementSummary ? (
                                        <>
                                            <div className="engagement-overview-row">
                                                <div className="engagement-overview-card">
                                                    <div className="stat-label">Reach Into Client Base</div>
                                                    <div className="finance-value">{formatPercent(engagementSummary.active_user_rate)}</div>
                                                    <div className="engagement-meta-line">
                                                        {engagementSummary.unique_active_users}/{engagementSummary.total_clients} clients active
                                                    </div>
                                                </div>
                                                <div className="engagement-overview-card">
                                                    <div className="stat-label">Stickiness</div>
                                                    <div className="finance-value">{formatPercent(engagementSummary.stickiness_rate)}</div>
                                                    <div className="engagement-meta-line">
                                                        Habit strength across returning users
                                                    </div>
                                                </div>
                                                <div className="engagement-overview-card">
                                                    <div className="stat-label">Repeat Active Clients</div>
                                                    <div className="finance-value">{engagementSummary.repeat_active_users}</div>
                                                    <div className="engagement-meta-line">
                                                        2+ active days in this range
                                                    </div>
                                                </div>
                                                <div className="engagement-overview-card">
                                                    <div className="stat-label">Surveys Per Active Client</div>
                                                    <div className="finance-value">{engagementSummary.surveys_per_active_user}</div>
                                                    <div className="engagement-meta-line">
                                                        Visit-to-log conversion
                                                    </div>
                                                </div>
                                                <div className="engagement-overview-card">
                                                    <div className="stat-label">Avg Reported Mood</div>
                                                    <div className={`finance-value ${getMoodToneClass(engagementSummary.average_mood_label)}`}>
                                                        {engagementSummary.average_mood_label || 'No Data'}
                                                    </div>
                                                    <div className="engagement-meta-line">
                                                        {engagementSummary.total_surveys_logged} survey logs
                                                        {engagementSummary.average_mood_score !== null && engagementSummary.average_mood_score !== undefined
                                                            ? ` • score ${engagementSummary.average_mood_score}`
                                                            : ''}
                                                    </div>
                                                </div>
                                                <div className="engagement-overview-card">
                                                    <div className="stat-label">Positive Mood Rate</div>
                                                    <div className={`finance-value ${getMoodToneClass(engagementSummary.average_mood_label)}`}>
                                                        {formatPercent(engagementSummary.positive_mood_rate)}
                                                    </div>
                                                    <div className="engagement-meta-line">
                                                        Good or Amazing survey entries
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="engage-row">
                                                <div className="engage-card">
                                                    <div className="stat-label">Daily Active Users</div>
                                                    <div className="finance-value" style={{ margin: '8px 0 16px' }}>{engagementSummary.today_active_users}</div>
                                                    <div className="line-chart">
                                                        {engagementChart.map((point) => (
                                                            <div
                                                                key={point.date}
                                                                className={`line-bar ${point.active_users === bestActiveUsers && point.active_users > 0 ? 'highlight' : ''}`}
                                                                style={{ height: `${maxActiveUsers ? Math.max((point.active_users / maxActiveUsers) * 100, point.active_users > 0 ? 10 : 0) : 0}%` }}
                                                                title={`${point.label}: ${point.active_users} active client${point.active_users === 1 ? '' : 's'}`}
                                                            ></div>
                                                        ))}
                                                    </div>
                                                    <div className="engagement-label-row">
                                                        {engagementChart.map((point, index) => (
                                                            <span key={point.date} className="bar-label">
                                                                {index % engagementLabelStep === 0 || index === engagementChart.length - 1 ? point.label : ''}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="finance-chart-footer">Peak activity day: {engagementSummary.best_active_day_label || 'N/A'}</div>
                                                </div>
                                                <div className="engage-card">
                                                    <div className="stat-label">Daily Survey Completions</div>
                                                    <div className="finance-value" style={{ margin: '8px 0 16px' }}>{formatPercent(engagementSummary.average_survey_completion_rate)}</div>
                                                    <div className="line-chart">
                                                        {engagementChart.map((point) => (
                                                            <div
                                                                key={point.date}
                                                                className={`line-bar ${point.survey_completion_rate === bestSurveyRate && point.survey_completion_rate > 0 ? 'highlight' : ''}`}
                                                                style={{ height: `${maxSurveyCompletions ? Math.max((point.survey_completions / maxSurveyCompletions) * 100, point.survey_completions > 0 ? 10 : 0) : 0}%` }}
                                                                title={`${point.label}: ${point.survey_completions} surveys, ${formatPercent(point.survey_completion_rate)} completion`}
                                                            ></div>
                                                        ))}
                                                    </div>
                                                    <div className="engagement-label-row">
                                                        {engagementChart.map((point, index) => (
                                                            <span key={point.date} className="bar-label">
                                                                {index % engagementLabelStep === 0 || index === engagementChart.length - 1 ? point.label : ''}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="finance-chart-footer">Best completion day: {engagementSummary.best_completion_day_label || 'N/A'} • Avg rate {formatPercent(engagementSummary.average_survey_completion_rate)}</div>
                                                </div>
                                                <div className="engage-card">
                                                    <div className="stat-label">Mood Breakdown</div>
                                                    <div className={`finance-value ${getMoodToneClass(engagementSummary.average_mood_label)}`} style={{ margin: '8px 0 16px' }}>
                                                        {engagementSummary.average_mood_label || 'No Data'}
                                                    </div>
                                                    <div className="mood-breakdown-list">
                                                        {moodBreakdown.map((mood) => (
                                                            <div key={mood.label} className="mood-breakdown-item">
                                                                <div className="mood-breakdown-topline">
                                                                    <span className={`mood-pill ${getMoodToneClass(mood.label)}`}>{mood.label}</span>
                                                                    <span className="mood-breakdown-meta">{mood.count} surveys • {formatPercent(mood.percentage)}</span>
                                                                </div>
                                                                <div className="mood-breakdown-track">
                                                                    <div
                                                                        className={`mood-breakdown-fill ${getMoodToneClass(mood.label)}`}
                                                                        style={{ width: `${mood.percentage}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="finance-chart-footer">
                                                        Most common mood: {engagementSummary.most_common_mood_label || 'No Data'}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="finance-empty-state">
                                            No engagement data is available yet. Once clients log in and submit daily surveys, trends will appear here.
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === 5 && (
                                <div className="tab-content">
                                    <div className="section-header">
                                        <div className="admin-section-title">Workout Plan Inventory</div>
                                        <div className="admin-search-bar">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6BA0" strokeWidth="2">
                                                <circle cx="11" cy="11" r="8" />
                                                <path d="m21 21-4.35-4.35" />
                                            </svg>
                                            <input type="text" placeholder="SEARCH WORKOUTS..." value={workoutSearch} onChange={(e) => setWorkoutSearch(e.target.value)} />
                                        </div>
                                    </div>
                                    {workoutError && <p className="feedback-msg error">{workoutError}</p>}
                                    <table className="admin-table">
                                        <thead>
                                            <tr><th>Workout Name</th><th>Goal</th><th>Experience</th><th>Duration (wks)</th><th>Actions</th></tr>
                                        </thead>
                                        <tbody>
                                            {workoutLoading ? (
                                                <tr><td colSpan="5"><span className="state-message loading">Loading workout plans...</span></td></tr>
                                            ) : filteredWorkouts.length === 0 ? (
                                                <tr><td colSpan="5"><span className="state-message">No workout plans found.</span></td></tr>
                                            ) : filteredWorkouts.map((w) => (
                                                <tr key={w.workout_id}>
                                                    <td><strong>{w.name}</strong></td>
                                                    <td>{w.goal_type || '—'}</td>
                                                    <td>{w.experience_level || '—'}</td>
                                                    <td>{w.intended_duration_weeks ?? '—'}</td>
                                                    <td>
                                                        <div className="actions-cell">
                                                            <Link className="btn-sm btn-outline-sm" to={`/edit-workout/${w.workout_id}`}>EDIT</Link>
                                                            <button className="btn-sm btn-red-outline" disabled={workoutActionId === w.workout_id} onClick={() => handleDeleteWorkout(w.workout_id)}>{workoutActionId === w.workout_id ? 'WORKING...' : 'DELETE'}</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {activeTab === 0 && (
                                <div className="tab-content">
                                    <div className="section-header">
                                        <div className="admin-section-title">All Clients</div>
                                        <div className="admin-search-bar">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6BA0" strokeWidth="2">
                                                <circle cx="11" cy="11" r="8" />
                                                <path d="m21 21-4.35-4.35" />
                                            </svg>
                                            <input type="text" placeholder="SEARCH CLIENTS..." value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
                                        </div>
                                    </div>
                                    {clientError && <p className="feedback-msg error">{clientError}</p>}
                                    <table className="admin-table">
                                        <thead>
                                            <tr><th>Client</th><th>Email</th><th>Weekly Streak</th><th>Status</th><th>Deactivation</th><th>Joined</th><th>Actions</th></tr>
                                        </thead>
                                        <tbody>
                                            {clientLoading ? (
                                                <tr><td colSpan="7"><span className="state-message loading">Loading clients...</span></td></tr>
                                            ) : filteredClients.length === 0 ? (
                                                <tr><td colSpan="7"><span className="state-message">No clients found.</span></td></tr>
                                            ) : filteredClients.map((client) => (
                                                <tr key={client.client_id}>
                                                    <td>
                                                        <button type="button" className="admin-profile-trigger admin-profile-trigger-inline" onClick={() => openProfileModal('client', client.client_id)}>
                                                            {client.profile_picture
                                                                ? <img src={client.profile_picture} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                                                : <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6B6BA0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                                                                    {(client.first_name?.[0] ?? '').toUpperCase()}{(client.last_name?.[0] ?? '').toUpperCase()}
                                                                  </div>
                                                            }
                                                            <strong>{client.first_name} {client.last_name}</strong>
                                                        </button>
                                                    </td>
                                                    <td>{client.email}</td>
                                                    <td>
                                                        {client.is_active ? (
                                                            client.weekly_streak
                                                        ) : (
                                                            <span
                                                                className="muted-cell-value"
                                                                title={`Historical streak: ${client.weekly_streak}`}
                                                            >
                                                                —
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td><span className={`status-badge ${getStatusClass(client.is_active ? 'Active' : 'Rejected')}`}>{client.is_active ? 'Active' : 'Inactive'}</span></td>
                                                    <td>
                                                        {client.is_active ? (
                                                            <span className="muted-cell-value">—</span>
                                                        ) : (
                                                            <span className="muted-cell-value" title={getClientDeactivationTooltip(client)}>
                                                                {formatClientDeactivationState(client)}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>{new Date(client.joined_at).toLocaleDateString()}</td>
                                                    <td>
                                                        {client.is_active ? (
                                                            <button className="btn-sm btn-red-outline" disabled={clientActionId === client.client_id} onClick={() => openClientStatusModal(client)}>
                                                                {clientActionId === client.client_id ? 'WORKING...' : 'DEACTIVATE'}
                                                            </button>
                                                        ) : (
                                                            <div className="actions-cell">
                                                                <button className="btn-sm btn-warn-outline" disabled={clientActionId === client.client_id} onClick={() => openClientStatusModal(client)}>
                                                                    {clientActionId === client.client_id ? 'WORKING...' : 'REACTIVATE'}
                                                                </button>
                                                                <button className="btn-sm btn-red-outline" disabled={clientActionId === client.client_id} onClick={() => openClientDeleteModal(client)}>
                                                                    {clientActionId === client.client_id ? 'WORKING...' : 'DELETE'}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {activeTab === 6 && (
                                <div className="tab-content">
                                    <div className="section-header">
                                        <div className="admin-section-title">Reports</div>
                                        <div className="admin-search-bar">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6BA0" strokeWidth="2">
                                                <circle cx="11" cy="11" r="8" />
                                                <path d="m21 21-4.35-4.35" />
                                            </svg>
                                            <input type="text" placeholder="SEARCH REPORTS..." value={reportSearch} onChange={(e) => setReportSearch(e.target.value)} />
                                        </div>
                                    </div>
                                    {reportError && <p className="feedback-msg error">{reportError}</p>}
                                    <table className="admin-table reports-table">
                                        <thead>
                                            <tr>
                                                <th>Reported Coach</th>
                                                <th>Reporter</th>
                                                <th>Reason</th>
                                                <th>Report Status</th>
                                                <th>Coach Status</th>
                                                <th>Submitted</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportLoading ? (
                                                <tr><td colSpan="7"><span className="state-message loading">Loading reports...</span></td></tr>
                                            ) : filteredReports.length === 0 ? (
                                                <tr><td colSpan="7"><span className="state-message">No reports found.</span></td></tr>
                                            ) : filteredReports.map((report) => (
                                                <tr key={report.report_id}>
                                                    <td>
                                                        <div className="report-name-stack">
                                                            <strong>{report.coach_name}</strong>
                                                            <span>{report.coach_email}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="report-name-stack">
                                                            <strong>{report.reporter_name}</strong>
                                                            <span>{report.reporter_email}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="report-reason-cell" title={report.reason || ''}>
                                                            {report.reason || '—'}
                                                        </div>
                                                    </td>
                                                    <td><span className={`status-badge ${getStatusClass(report.status)}`}>{report.status}</span></td>
                                                    <td><span className={`status-badge ${getStatusClass(report.coach_status || 'Rejected')}`}>{report.coach_status || 'Unknown'}</span></td>
                                                    <td>{new Date(report.created_at).toLocaleDateString()}</td>
                                                    <td>
                                                        <div className="actions-cell report-actions-cell">
                                                            <button
                                                                className="btn-outline-sm"
                                                                disabled={reportActionId === report.report_id || report.status !== 'Pending'}
                                                                onClick={() => handleUpdateReportStatus(report.report_id, 'Resolved')}
                                                            >
                                                                {reportActionId === report.report_id ? 'WORKING...' : 'RESOLVE'}
                                                            </button>
                                                            <button
                                                                className="btn-red-outline"
                                                                disabled={reportActionId === report.report_id || report.status !== 'Pending'}
                                                                onClick={() => handleUpdateReportStatus(report.report_id, 'Dismissed')}
                                                            >
                                                                {reportActionId === report.report_id ? 'WORKING...' : 'DISMISS'}
                                                            </button>
                                                            {report.coach_status === 'Suspended' ? (
                                                                <button
                                                                    className="btn-warn-outline"
                                                                    disabled={coachActionId === report.coach_id || report.status !== 'Pending'}
                                                                    onClick={() => handleReactivate(report.coach_id)}
                                                                >
                                                                    {coachActionId === report.coach_id ? 'WORKING...' : 'REACTIVATE'}
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="btn-warn-outline"
                                                                    disabled={coachActionId === report.coach_id || report.status !== 'Pending'}
                                                                    onClick={() => handleSuspend(report.coach_id)}
                                                                >
                                                                    {coachActionId === report.coach_id ? 'WORKING...' : 'SUSPEND'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        {profileModal && (
                            <div className="admin-modal-overlay" onClick={closeProfileModal}>
                                <div className="admin-modal admin-profile-modal" onClick={(e) => e.stopPropagation()}>
                                    <div className="admin-modal-header">
                                        <div className="admin-section-title">
                                            {profileModal.type === 'client' ? 'Client Profile' : 'Coach Profile'}
                                        </div>
                                        <button className="admin-modal-close" onClick={closeProfileModal}>X</button>
                                    </div>
                                    {profileModal.loading ? (
                                        <p className="state-message loading">Loading profile...</p>
                                    ) : profileModal.error ? (
                                        <p className="feedback-msg error">{profileModal.error}</p>
                                    ) : profileModal.data && profileModal.type === 'client' ? (
                                        <div className="admin-profile-layout">
                                            <div className="admin-profile-hero">
                                                {profileModal.data.profile_picture ? (
                                                    <img
                                                        src={resolveMediaUrl(profileModal.data.profile_picture)}
                                                        alt=""
                                                        className="admin-profile-avatar"
                                                    />
                                                ) : (
                                                    <div className="admin-profile-avatar admin-profile-avatar-fallback">
                                                        {(profileModal.data.first_name?.[0] ?? '').toUpperCase()}{(profileModal.data.last_name?.[0] ?? '').toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="admin-profile-hero-copy">
                                                    <div className="admin-profile-name">{`${profileModal.data.first_name || ''} ${profileModal.data.last_name || ''}`.trim() || profileModal.data.email}</div>
                                                    <div className="admin-profile-email">{profileModal.data.email}</div>
                                                    <div className="admin-profile-badges">
                                                        <span className={`status-badge ${getStatusClass(profileModal.data.is_active ? 'Active' : 'Rejected')}`}>
                                                            {profileModal.data.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                        {!profileModal.data.is_active && (
                                                            <span className="status-badge status-suspended">
                                                                {profileModal.data.deactivated_by_admin ? 'Admin Hold' : 'Self Deactivated'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="admin-profile-grid">
                                                <div className="admin-profile-card">
                                                    <div className="stat-heading">Account</div>
                                                    <div className="admin-profile-detail-list">
                                                        <div><strong>Joined:</strong> {formatDateLabel(profileModal.data.joined_at)}</div>
                                                        <div><strong>Weekly Streak:</strong> {profileModal.data.weekly_streak}</div>
                                                        <div><strong>Deactivated:</strong> {formatDateTimeLabel(profileModal.data.deactivated_at)}</div>
                                                        <div><strong>Scheduled Deletion:</strong> {profileModal.data.deactivated_by_admin ? 'Admin hold' : formatDateTimeLabel(profileModal.data.scheduled_deletion_at)}</div>
                                                    </div>
                                                </div>
                                                <div className="admin-profile-card">
                                                    <div className="stat-heading">Body Stats</div>
                                                    <div className="admin-profile-detail-list">
                                                        <div><strong>Age:</strong> {profileModal.data.age ?? '—'}</div>
                                                        <div><strong>Height:</strong> {profileModal.data.height_cm ? `${profileModal.data.height_cm} cm` : '—'}</div>
                                                        <div><strong>Current Weight:</strong> {formatWeightLb(profileModal.data.weight_lb)}</div>
                                                        <div><strong>Goal Weight:</strong> {formatWeightLb(profileModal.data.goal_weight_lb)}</div>
                                                        <div><strong>Sex:</strong> {profileModal.data.sex || '—'}</div>
                                                    </div>
                                                </div>
                                                <div className="admin-profile-card">
                                                    <div className="stat-heading">Goals & Coaching</div>
                                                    <div className="admin-profile-detail-list">
                                                        <div><strong>Goals:</strong> {profileModal.data.goals?.length ? profileModal.data.goals.join(', ') : 'None set'}</div>
                                                        <div><strong>Active Coach:</strong> {profileModal.data.active_coach_name || 'None assigned'}</div>
                                                        <div><strong>Coach Email:</strong> {profileModal.data.active_coach_email || '—'}</div>
                                                        <div><strong>Last Survey:</strong> {formatDateLabel(profileModal.data.last_survey_date)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : profileModal.data ? (
                                        <div className="admin-profile-layout">
                                            <div className="admin-profile-hero">
                                                {profileModal.data.profile_picture ? (
                                                    <img
                                                        src={resolveMediaUrl(profileModal.data.profile_picture)}
                                                        alt=""
                                                        className="admin-profile-avatar"
                                                    />
                                                ) : (
                                                    <div className="admin-profile-avatar admin-profile-avatar-fallback">
                                                        {(profileModal.data.first_name?.[0] ?? '').toUpperCase()}{(profileModal.data.last_name?.[0] ?? '').toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="admin-profile-hero-copy">
                                                    <div className="admin-profile-name">{`${profileModal.data.first_name || ''} ${profileModal.data.last_name || ''}`.trim() || profileModal.data.email}</div>
                                                    <div className="admin-profile-email">{profileModal.data.email}</div>
                                                    <div className="admin-profile-badges">
                                                        <span className={`status-badge ${getStatusClass(profileModal.data.status)}`}>{profileModal.data.status}</span>
                                                        <span className={`status-badge ${getStatusClass(profileModal.data.is_active_user ? 'Active' : 'Rejected')}`}>
                                                            {profileModal.data.is_active_user ? 'User Active' : 'User Inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="admin-profile-grid">
                                                <div className="admin-profile-card">
                                                    <div className="stat-heading">Coaching Status</div>
                                                    <div className="admin-profile-detail-list">
                                                        <div><strong>Specialization:</strong> {profileModal.data.specialization}</div>
                                                        <div><strong>Accepting Clients:</strong> {profileModal.data.accepting_clients ? 'Yes' : 'No'}</div>
                                                        <div><strong>Hourly Rate:</strong> {formatCurrency(profileModal.data.hourly_rate)}</div>
                                                        <div><strong>Submitted:</strong> {formatDateLabel(profileModal.data.submitted_at)}</div>
                                                    </div>
                                                </div>
                                                <div className="admin-profile-card">
                                                    <div className="stat-heading">Background</div>
                                                    <div className="admin-profile-detail-list">
                                                        <div><strong>Gender:</strong> {profileModal.data.gender || '—'}</div>
                                                        <div><strong>Experience:</strong> {profileModal.data.years_of_experience ?? '—'} {profileModal.data.years_of_experience != null ? 'years' : ''}</div>
                                                        <div><strong>Max Clients:</strong> {profileModal.data.max_clients ?? '—'}</div>
                                                        <div><strong>Bio:</strong> {profileModal.data.bio || 'No bio provided.'}</div>
                                                    </div>
                                                </div>
                                                <div className="admin-profile-card">
                                                    <div className="stat-heading">Capacity</div>
                                                    <div className="admin-profile-detail-list">
                                                        <div><strong>Active Clients:</strong> {profileModal.data.active_client_count}</div>
                                                        <div><strong>Pending Requests:</strong> {profileModal.data.pending_client_count}</div>
                                                        <div><strong>Certifications:</strong> {profileModal.data.certifications?.length ? profileModal.data.certifications.join(', ') : 'None listed'}</div>
                                                        <div><strong>Availability:</strong> {profileModal.data.availability?.length ? profileModal.data.availability.join(' • ') : 'Not provided'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        )}
                        {clientStatusModal && (
                            <div className="admin-modal-overlay" onClick={closeClientStatusModal}>
                                <div className="admin-modal admin-confirm-modal" onClick={(e) => e.stopPropagation()}>
                                    <div className="admin-modal-header">
                                        <div className="admin-section-title">
                                            {clientStatusModal.isActive ? 'Deactivate Client' : 'Reactivate Client'}
                                        </div>
                                        <button className="admin-modal-close" onClick={closeClientStatusModal}>X</button>
                                    </div>
                                    <p className="admin-confirm-copy">
                                        {clientStatusModal.isActive
                                            ? `Deactivate ${clientStatusModal.clientName}? This will remove their access, terminate active coaching contracts, and place the account on admin hold until an admin reactivates or deletes it.`
                                            : `Reactivate ${clientStatusModal.clientName}? This will restore their access to the platform.`}
                                    </p>
                                    <div className="admin-modal-actions">
                                        <button type="button" className="btn-outline-sm" onClick={closeClientStatusModal}>Cancel</button>
                                        <button
                                            type="button"
                                            className={clientStatusModal.isActive ? 'btn-red-outline' : 'btn-warn-outline'}
                                            onClick={confirmClientStatusAction}
                                            disabled={clientActionId === clientStatusModal.clientId}
                                        >
                                            {clientActionId === clientStatusModal.clientId
                                                ? 'WORKING...'
                                                : clientStatusModal.isActive
                                                    ? 'DEACTIVATE'
                                                    : 'REACTIVATE'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {clientDeleteModal && (
                            <div className="admin-modal-overlay" onClick={closeClientDeleteModal}>
                                <div className="admin-modal admin-confirm-modal" onClick={(e) => e.stopPropagation()}>
                                    <div className="admin-modal-header">
                                        <div className="admin-section-title">Delete Client Account</div>
                                        <button className="admin-modal-close" onClick={closeClientDeleteModal}>X</button>
                                    </div>
                                    <p className="admin-confirm-copy">
                                        Permanently delete {clientDeleteModal.clientName}? This removes the account and its related data. This action cannot be undone.
                                    </p>
                                    <div className="admin-modal-actions">
                                        <button type="button" className="btn-outline-sm" onClick={closeClientDeleteModal}>Cancel</button>
                                        <button
                                            type="button"
                                            className="btn-red-outline"
                                            onClick={confirmDeleteClient}
                                            disabled={clientActionId === clientDeleteModal.clientId}
                                        >
                                            {clientActionId === clientDeleteModal.clientId ? 'WORKING...' : 'DELETE'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="footer-spacer"></div>
                    </div>
            </div>
        </div>
    );
};
