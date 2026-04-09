import './App.css'
import { Route, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { AuthSync } from './components/AuthSync'

import { Home, Exercises, Workouts, Login, ClientDashboard, CoachDashboard, AdminDashboard, SignUp, Survey, ViewWorkout, EditWorkout, ClientCalendar } from './pages'
import { CalendarComponent } from './components/CalendarComponent'

function App() {
    return (
        <div className="App">
            <AuthSync />
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/exercises" element={<Exercises />} />
                <Route path="/workouts" element={<Workouts />} />
                <Route path="/login" element={<Login />} />
                <Route path="/client-dashboard" element={<ClientDashboard />} />
                <Route path="/coach-dashboard" element={<CoachDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/survey" element={<Survey />} />
                <Route path="/view-workout/:workoutId" element={<ViewWorkout />} />
                <Route path="/edit-workout/:workoutId" element={<EditWorkout />} />
                <Route path="/calendar" element={<ClientCalendar />} />
            </Routes>
        </div>
    )
}

export default App
