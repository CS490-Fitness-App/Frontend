import './App.css'
import { Route, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar'

import { Home, Exercises, Workouts, Login } from './components/pages'

function App() {
  return (
      <div className="App">
          <Navbar />
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/exercises" element={<Exercises />} />
              <Route path="/workouts" element={<Workouts />} />
              <Route path="/login" element={<Login />} />
          </Routes>
      </div>
  )
}

export default App
