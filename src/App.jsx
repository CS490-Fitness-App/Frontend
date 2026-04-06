import './App.css'
import { Route, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { AuthSync } from './components/AuthSync'

import { Home, Exercises, Workouts, Login, ClientDashboard, SignUp, Survey, ViewWorkout, EditWorkout } from './pages'
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
                <Route path="/signup" element={<SignUp />} />
                <Route path="/survey" element={<Survey />} />
                <Route path="/view-workout" element={<ViewWorkout />} />
                <Route path="/edit-workout" element={<EditWorkout />} />
                <Route path="/calendar" element={<CalendarComponent />} />
            </Routes>
        </div>
    )
}

export default App