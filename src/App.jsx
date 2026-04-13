import './App.css'
import { Route, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { AuthSync } from './components/AuthSync'
import { ProtectedRoute } from './components/ProtectedRoute'


import { Home, Exercises, Workouts, Login, ClientDashboard, CoachDashboard, AdminDashboard, SignUp, Survey, Coaches, PaymentCards } from './pages'

function App() {
    return (
        <div className="App">
            <AuthSync />
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/exercises" element={<Exercises />} />
                <Route path="/coaches" element={<Coaches/>} />
                <Route path="/workouts" element={<Workouts />} />
                <Route path="/login" element={<Login />} />
                <Route path="/client-dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
                <Route path="/coach-dashboard" element={<ProtectedRoute><CoachDashboard /></ProtectedRoute>} />
                <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/survey" element={<ProtectedRoute><Survey /></ProtectedRoute>} />
                <Route path="/payment-cards" element={<ProtectedRoute><PaymentCards /></ProtectedRoute>} />
            </Routes>
        </div>
    )
}

export default App