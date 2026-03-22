import './App.css'
import { Route, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar'

import { Home, Exercises, Workouts, Login, ClientDashboard, SignUp, Survey } from './pages'

function App() {
    return (
        <div className="App">
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/exercises" element={<Exercises />} />
                <Route path="/workouts" element={<Workouts />} />
                <Route path="/login" element={<Login />} />
                <Route path="/client-dashboard" element={<ClientDashboard />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/survey" element={<Survey />} />
            </Routes>
        </div>
    )
}

export default App