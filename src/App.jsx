import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import PortfolioManager from './pages/admin/PortfolioManager'
import ComingSoon from './pages/admin/ComingSoon'
import ProtectedRoute from './components/admin/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import './App.css'

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="projects" element={<PortfolioManager />} />
        <Route path="portfolio" element={<Navigate to="/admin/projects" replace />} />
        <Route path="profile" element={<ComingSoon title="Profile" />} />
        <Route path="contact" element={<ComingSoon title="Contact" />} />
        <Route path="resume" element={<ComingSoon title="Resume" />} />
      </Route>
    </Routes>
  )
}

export default App
