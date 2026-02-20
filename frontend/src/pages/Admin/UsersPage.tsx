import React, { useEffect, useMemo, useState } from 'react'
import Modal from '../../components/Modal'
import { getDepartments, type Department } from '../../lib/departments'
import { createUser, getUsers, resetUserPassword, updateUser, type Role, type User } from '../../lib/users'

type Notice = { type: 'success' | 'error'; message: string } | null

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [depts, setDepts] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [notice, setNotice] = useState<Notice>(null)

  // create form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('OFFICER')
  const [departmentId, setDepartmentId] = useState<number | ''>('')
  const [saving, setSaving] = useState(false)

  const [search, setSearch] = useState('')

  // ===== Modals =====
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Edit modal
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editRole, setEditRole] = useState<Role>('OFFICER')
  const [editDeptId, setEditDeptId] = useState<number | ''>('')
  const [editActive, setEditActive] = useState(true)
  const [editSaving, setEditSaving] = useState(false)

  // Reset password modal
  const [pwdOpen, setPwdOpen] = useState(false)
  const [newPass, setNewPass] = useState('')
  const [pwdSaving, setPwdSaving] = useState(false)

  // Confirm activate/deactivate modal
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmSaving, setConfirmSaving] = useState(false)

  const showSuccess = (message: string) => setNotice({ type: 'success', message })
  const showError = (message: string) => setNotice({ type: 'error', message })

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const [u, d] = await Promise.all([getUsers(), getDepartments()])
      setUsers(u)
      setDepts(d)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) =>
      [u.name, u.email, u.role, u.department?.name, u.department?.code]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [users, search])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setNotice(null)
    setSaving(true)

    try {
      if (role === 'OFFICER' && departmentId === '') {
        showError('OFFICER must have a department.')
        return
      }

      await createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        ...(departmentId !== '' ? { departmentId: Number(departmentId) } : {}),
      })

      setName('')
      setEmail('')
      setPassword('')
      setRole('OFFICER')
      setDepartmentId('')

      await load()
      showSuccess('User created successfully.')
    } catch (e: any) {
      showError(e?.response?.data?.message ?? 'Create failed.')
    } finally {
      setSaving(false)
    }
  }

  const openEditModal = (u: User) => {
    setNotice(null)
    setSelectedUser(u)
    setEditName(u.name)
    setEditEmail(u.email)
    setEditRole(u.role)
    setEditDeptId(u.department?.id ?? '')
    setEditActive(u.isActive)
    setEditOpen(true)
  }

  const closeEditModal = () => {
    setEditOpen(false)
    setSelectedUser(null)
  }

  const openPasswordModal = (u: User) => {
    setNotice(null)
    setSelectedUser(u)
    setNewPass('')
    setPwdOpen(true)
  }

  const closePasswordModal = () => {
    setPwdOpen(false)
    setSelectedUser(null)
    setNewPass('')
  }

  const openConfirmToggle = (u: User) => {
    setNotice(null)
    setSelectedUser(u)
    setConfirmOpen(true)
  }

  const closeConfirmToggle = () => {
    setConfirmOpen(false)
    setSelectedUser(null)
  }

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    setNotice(null)

    if (editRole === 'OFFICER' && editDeptId === '') {
      showError('OFFICER must have a department.')
      return
    }

    setEditSaving(true)
    try {
      await updateUser(selectedUser.id, {
        name: editName.trim(),
        email: editEmail.trim().toLowerCase(),
        role: editRole,
        departmentId: editRole === 'OFFICER' ? Number(editDeptId) : null,
        isActive: editActive,
      })
      await load()
      closeEditModal()
      showSuccess('User updated successfully.')
    } catch (e: any) {
      showError(e?.response?.data?.message ?? 'Update failed.')
    } finally {
      setEditSaving(false)
    }
  }

  const confirmToggleActive = async () => {
    if (!selectedUser) return
    setNotice(null)
    setConfirmSaving(true)

    try {
      await updateUser(selectedUser.id, { isActive: !selectedUser.isActive })
      await load()
      closeConfirmToggle()
      showSuccess(selectedUser.isActive ? 'User deactivated.' : 'User activated.')
    } catch (e: any) {
      showError(e?.response?.data?.message ?? 'Update failed.')
    } finally {
      setConfirmSaving(false)
    }
  }

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    setNotice(null)

    if (newPass.length < 6) {
      showError('Password must be at least 6 characters.')
      return
    }

    setPwdSaving(true)
    try {
      await resetUserPassword(selectedUser.id, newPass)
      closePasswordModal()
      showSuccess('Password reset successfully.')
    } catch (e: any) {
      showError(e?.response?.data?.message ?? 'Reset failed.')
    } finally {
      setPwdSaving(false)
    }
  }

  const badge = (value: string) => {
    const base = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset'
    if (value === 'ADMIN') return <span className={`${base} bg-indigo-50 text-indigo-700 ring-indigo-200`}>ADMIN</span>
    if (value === 'OFFICER') return <span className={`${base} bg-emerald-50 text-emerald-700 ring-emerald-200`}>OFFICER</span>
    return <span className={`${base} bg-slate-50 text-slate-700 ring-slate-200`}>VIEWER</span>
  }

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Users</h2>
            <p className="mt-1 text-sm text-slate-500">Create and manage admin/officer/viewer accounts.</p>
          </div>
        </div>

        {/* Notice */}
        {notice && (
          <div
            className={[
              'mb-4 rounded-xl border px-4 py-3 text-sm',
              notice.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-rose-200 bg-rose-50 text-rose-800',
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-3">
              <div>{notice.message}</div>
              <button
                onClick={() => setNotice(null)}
                className="rounded-md px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-white/60"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Create user card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-base font-semibold text-slate-900">Create User</h3>
            <p className="mt-1 text-sm text-slate-500">
              Officers must be assigned to a department.
            </p>
          </div>

          <div className="px-5 py-4">
            <form onSubmit={onCreate} className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-sm font-medium text-slate-700">Name</span>
                <input
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                  placeholder="e.g. Finance Officer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                  placeholder="name@toyota.lk"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <input
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                  placeholder="Min 6 characters"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-sm font-medium text-slate-700">Role</span>
                <select
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="OFFICER">OFFICER</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </label>

              <label className="grid gap-1.5 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Department (OFFICER only)</span>
                <select
                  className={[
                    'h-11 rounded-xl border px-3 text-sm shadow-sm outline-none transition focus:ring-2',
                    role !== 'OFFICER'
                      ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
                      : 'border-slate-200 bg-white text-slate-900 focus:border-slate-300 focus:ring-slate-200',
                  ].join(' ')}
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value === '' ? '' : Number(e.target.value))}
                  disabled={role !== 'OFFICER'}
                >
                  <option value="">Select department</option>
                  {depts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </label>

              <div className="md:col-span-2 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  * OFFICER must have a department. ADMIN/VIEWER can be without.
                </p>

                <button
                  disabled={saving}
                  type="submit"
                  className={[
                    'inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold shadow-sm transition',
                    saving
                      ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                      : 'bg-slate-900 text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300',
                  ].join(' ')}
                >
                  {saving ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* List card */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">User List</h3>
              <p className="mt-1 text-sm text-slate-500">Search and manage existing users.</p>
            </div>

            <div className="w-full md:max-w-sm">
              <input
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="px-5 py-4">
            {loading && <p className="text-sm text-slate-500">Loading...</p>}
            {error && <p className="text-sm text-rose-600">{error}</p>}

            {!loading && !error && (
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filtered.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 text-sm text-slate-700">{u.id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{u.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{u.email}</td>
                        <td className="px-4 py-3 text-sm">{badge(u.role)}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {u.department ? `${u.department.name} (${u.department.code})` : <span className="text-slate-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={[
                              'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
                              u.isActive ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-rose-50 text-rose-700 ring-rose-200',
                            ].join(' ')}
                          >
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => openEditModal(u)}
                              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                              type="button"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => openConfirmToggle(u)}
                              className={[
                                'inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold shadow-sm transition focus:outline-none focus:ring-2',
                                u.isActive
                                  ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100/70 focus:ring-rose-200'
                                  : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70 focus:ring-emerald-200',
                              ].join(' ')}
                              type="button"
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>

                            <button
                              onClick={() => openPasswordModal(u)}
                              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                              type="button"
                            >
                              Reset Password
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Edit User Modal */}
        <Modal open={editOpen} title="Edit User" onClose={closeEditModal}>
          <form onSubmit={saveEdit} className="grid gap-4">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-slate-700">Name</label>
              <input
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-slate-700">Role</label>
              <select
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as Role)}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="OFFICER">OFFICER</option>
                <option value="VIEWER">VIEWER</option>
              </select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-slate-700">Department (OFFICER only)</label>
              <select
                className={[
                  'h-11 rounded-xl border px-3 text-sm shadow-sm outline-none transition focus:ring-2',
                  editRole !== 'OFFICER'
                    ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
                    : 'border-slate-200 bg-white text-slate-900 focus:border-slate-300 focus:ring-slate-200',
                ].join(' ')}
                value={editDeptId}
                onChange={(e) => setEditDeptId(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={editRole !== 'OFFICER'}
              >
                <option value="">Select department</option>
                {depts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
              />
              <span className="text-sm text-slate-700">Active</span>
            </label>

            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEditModal}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                Cancel
              </button>
              <button
                disabled={editSaving}
                type="submit"
                className={[
                  'inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2',
                  editSaving
                    ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                    : 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-300',
                ].join(' ')}
              >
                {editSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Confirm Activate/Deactivate Modal */}
        <Modal open={confirmOpen} title="Confirm" onClose={closeConfirmToggle}>
          <div className="grid gap-4">
            <div className="text-sm text-slate-700">
              Are you sure you want to{' '}
              <span className="font-semibold text-slate-900">{selectedUser?.isActive ? 'deactivate' : 'activate'}</span>{' '}
              this user?
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {selectedUser?.email}
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeConfirmToggle}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                Cancel
              </button>
              <button
                disabled={confirmSaving}
                onClick={confirmToggleActive}
                className={[
                  'inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2',
                  confirmSaving
                    ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                    : selectedUser?.isActive
                    ? 'bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-200',
                ].join(' ')}
                type="button"
              >
                {confirmSaving ? 'Please wait...' : selectedUser?.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Reset Password Modal */}
        <Modal open={pwdOpen} title="Reset Password" onClose={closePasswordModal}>
          <form onSubmit={savePassword} className="grid gap-4">
            <div className="text-sm text-slate-600">
              User: <span className="font-semibold text-slate-900">{selectedUser?.email}</span>
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-slate-700">New Password</label>
              <input
                type="password"
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Min 6 characters"
                required
              />
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={closePasswordModal}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                Cancel
              </button>
              <button
                disabled={pwdSaving}
                type="submit"
                className={[
                  'inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2',
                  pwdSaving ? 'cursor-not-allowed bg-slate-200 text-slate-500' : 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-300',
                ].join(' ')}
              >
                {pwdSaving ? 'Resetting...' : 'Reset'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}