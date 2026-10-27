import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import PortfolioManager from './pages/admin/PortfolioManager'
import ComingSoon from './pages/admin/ComingSoon'
import ResumeManager from './pages/admin/ResumeManager'
import ProtectedRoute from './components/admin/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import './App.css'

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />

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
        <Route path="resume" element={<ResumeManager />} />
      </Route>
    </Routes>
  )
}

export default App
