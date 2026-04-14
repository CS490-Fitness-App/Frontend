import './App.css'
import { Route, Routes, Outlet } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Sidebar } from "./components/Sidebar"
import { AuthSync } from './components/AuthSync'
import { ProtectedRoute } from './components/ProtectedRoute'

import { Home, Exercises, Workouts, Login, ClientDashboard, CoachDashboard, AdminDashboard, SignUp, Survey, Coaches, PaymentCards, ViewWorkout, EditWorkout, ClientCalendar, UserProfile, EditProfile } from './pages'

const PublicLayout = () => (
    <>
        <Navbar />
        <div className="content">
            <Outlet />
        </div>
    </>
)

const PrivateLayout = () => (
    <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content" style={{ flex: 1 }}>
            <Outlet />
        </div>
    </div>
)

function App() {
    return (
        <div className="App">
            <AuthSync />
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/coaches" element={<Coaches />} />
                    <Route path="/exercises" element={<Exercises />} />
                    <Route path="/workouts" element={<Workouts />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                </Route>

                {/*<Route element={<ProtectedRoute><PrivateLayout /></ProtectedRoute>}>*/}
                <Route element={<PrivateLayout />}>
                    <Route path="/client-dashboard" element={<ClientDashboard />} />
                    <Route path="/coach-dashboard" element={<CoachDashboard />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/survey" element={<Survey />} />
                    <Route path="/payment-cards" element={<PaymentCards />} />
                    <Route path="/view-workout/:workoutId" element={<ViewWorkout />} />
                    <Route path="/edit-workout/:workoutId" element={<EditWorkout />} />
                    <Route path="/calendar" element={<ClientCalendar />} />
                    <Route path="/user-profile" element={<UserProfile />} />
                    <Route path="/edit-profile" element={<EditProfile />} />
                </Route>
            </Routes>
        </div>
    )
}

export default App
