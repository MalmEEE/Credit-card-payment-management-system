import React, { useEffect, useMemo, useState } from 'react'
import { createDepartment, getDepartments, updateDepartmentLimit, type Department } from '../../lib/departments'

export default function DepartmentsPage() {
  const [items, setItems] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [limitUsd, setLimitUsd] = useState<number>(0)
  const [saving, setSaving] = useState(false)

  const totalLimit = useMemo(
    () => items.reduce((sum, d) => sum + Number(d.limitUsd || 0), 0),
    [items],
  )

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getDepartments()
      setItems(data)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load departments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createDepartment({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        limitUsd,
      })
      setName('')
      setCode('')
      setLimitUsd(0)
      await load()
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Create failed')
    } finally {
      setSaving(false)
    }
  }

  const onUpdateLimit = async (id: number, current: string) => {
    const raw = prompt('Enter new allocated limit (USD):', String(current))
    if (raw === null) return
    const n = Number(raw)
    if (!Number.isFinite(n) || n < 0) {
      alert('Please enter a valid number >= 0')
      return
    }
    try {
      await updateDepartmentLimit(id, n)
      await load()
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Update failed')
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Departments</h2>
      <p>
        Total allocated limit (all departments): <b>${totalLimit.toFixed(2)}</b>
      </p>

      <div style={{ display: 'grid', gap: 16, maxWidth: 900 }}>
        <div style={{ padding: 16, border: '1px solid #ddd', borderRadius: 12 }}>
          <h3>Add Department</h3>
          <form onSubmit={onCreate} style={{ display: 'grid', gap: 10, maxWidth: 420 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Department name" required />
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code (e.g., IT)" required />
            <input
              value={String(limitUsd)}
              onChange={(e) => setLimitUsd(Number(e.target.value))}
              type="number"
              min={0}
              step="0.01"
              placeholder="Allocated Limit USD"
            />
            <button disabled={saving} type="submit">
              {saving ? 'Saving...' : 'Create'}
            </button>
          </form>
        </div>

        <div style={{ padding: 16, border: '1px solid #ddd', borderRadius: 12 }}>
          <h3>Department List</h3>

          {loading && <p>Loading...</p>}
          {error && <p style={{ color: 'crimson' }}>{error}</p>}

          {!loading && !error && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>ID</th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Name</th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Code</th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Limit (USD)</th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((d) => (
                  <tr key={d.id}>
                    <td style={{ padding: 8, borderBottom: '1px solid #f5f5f5' }}>{d.id}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f5f5f5' }}>{d.name}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f5f5f5' }}>{d.code}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f5f5f5' }}>
                      ${Number(d.limitUsd).toFixed(2)}
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f5f5f5' }}>
                      <button onClick={() => onUpdateLimit(d.id, d.limitUsd)}>Edit Limit</button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 12 }}>
                      No departments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}