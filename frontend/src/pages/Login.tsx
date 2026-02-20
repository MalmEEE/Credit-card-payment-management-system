import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../lib/auth'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const nav = useNavigate()
  const { refresh } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await login(email, password)
      await refresh()

      // role-based redirect (simple)
      if (res.user.role === 'ADMIN') nav('/admin', { replace: true })
      else if (res.user.role === 'OFFICER') nav('/officer', { replace: true })
      else nav('/viewer', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: 24, border: '1px solid #ddd', borderRadius: 12 }}>
      <h2>Login</h2>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <input
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />
        {error && <div style={{ color: 'crimson' }}>{String(error)}</div>}
        <button disabled={loading} type="submit">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}