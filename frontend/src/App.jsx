import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ProfessionalLogin from './Pages/Loginpage'
import ProfessionalSignup from './Pages/Signuppage'
import Dashboard from './Pages/Dashboard'
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<ProfessionalLogin />} />
      <Route path="/signup" element={<ProfessionalSignup />} />
      <Route path='/dashboard' element={<Dashboard />} />
    </Routes>
  )
}

export default App