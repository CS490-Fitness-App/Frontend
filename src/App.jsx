import './App.css'
import { Route, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { AuthSync } from './components/AuthSync'
import { ProtectedRoute } from './components/ProtectedRoute'

import { Home, Exercises, Workouts, PublicWorkouts, Login, ClientDashboard, CoachDashboard, AdminDashboard, SignUp, Survey, Coaches, PaymentCards, Profile, ViewWorkout, EditWorkout, ClientCalendar, ChatPage, ViewProgress, ActivityLogger } from './pages'

function App() {
    const NotFound = () => (
        <div style={{ padding: '48px', fontFamily: "'Space Mono', monospace" }}>
            <h2>Page not found</h2>
            <p>The page you are looking for does not exist.</p>
        </div>
    )

    return (
        <div className="App">
            <AuthSync />
            <Navbar />
            <div className="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/coaches" element={<Coaches />} />
                    <Route path="/exercises" element={<Exercises />} />
                    <Route path="/workouts" element={<PublicWorkouts />} />
                    <Route path="/my-workouts" element={<ProtectedRoute allowedRoles={['client', 'coach', 'admin']}><Workouts /></ProtectedRoute>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/client-dashboard" element={<ProtectedRoute allowedRoles={['client', 'coach']}><ClientDashboard /></ProtectedRoute>} />
                    <Route path="/coach-dashboard" element={<ProtectedRoute allowedRoles={['coach']}><CoachDashboard /></ProtectedRoute>} />
                    <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/survey" element={<ProtectedRoute allowedRoles={['client', 'coach']}><Survey /></ProtectedRoute>} />
                    <Route path="/payment-cards" element={<ProtectedRoute allowedRoles={['client', 'coach']}><PaymentCards /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute allowedRoles={['client', 'coach', 'admin']}><Profile /></ProtectedRoute>} />
                    <Route path="/view-workout/:workoutId" element={<ProtectedRoute allowedRoles={['client', 'coach', 'admin']}><ViewWorkout /></ProtectedRoute>} />
                    <Route path="/edit-workout/:workoutId" element={<ProtectedRoute allowedRoles={['client', 'coach', 'admin']}><EditWorkout /></ProtectedRoute>} />
                    <Route path="/create-workout" element={<ProtectedRoute allowedRoles={['client', 'coach', 'admin']}><EditWorkout /></ProtectedRoute>} />
                    <Route path="/calendar" element={<ProtectedRoute allowedRoles={['client', 'coach']}><ClientCalendar /></ProtectedRoute>} />
                    <Route path="/activity-logger" element={<ProtectedRoute allowedRoles={['client', 'coach']}><ActivityLogger /></ProtectedRoute>} />
                    <Route path="/chat" element={<ProtectedRoute allowedRoles={['client', 'coach']}><ChatPage /></ProtectedRoute>} />
                    <Route path="/view-progress" element={<ProtectedRoute allowedRoles={['client', 'coach']}><ViewProgress /></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </div>
    )
}

export default App
