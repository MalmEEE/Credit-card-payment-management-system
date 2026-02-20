import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Dashboard</h2>
      <p>Logged in as: {user?.email}</p>

      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/admin/departments">Manage Departments</Link>
        <Link to="/admin/users">Manage Users</Link>
      </div>
      <button onClick={logout}>Logout</button>
    </div>
  )
}