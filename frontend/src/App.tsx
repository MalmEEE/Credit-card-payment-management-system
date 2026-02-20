import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './pages/Admin/AdminDashboard'
import DepartmentsPage from './pages/Admin/DepartmentsPage'
import AdminRoute from './components/AdminRoute'
import UsersPage from './pages/Admin/UsersPage'

function App() {
  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />

      <Route
        path='/admin'
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <UsersPage />
          </AdminRoute>
        }
      />

      <Route
        path='/admin/departments'
        element={
          <AdminRoute>
            <DepartmentsPage />
          </AdminRoute>
        }
      />

      <Route path='/' element={<Navigate to="/login" replace />} />
      <Route path='*' element={<div style={{ padding: 24 }}>Not found</div>} />
    </Routes>
  )
}

export default App
