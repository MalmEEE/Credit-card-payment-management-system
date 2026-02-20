import { api } from './api'

export type Role = 'ADMIN' | 'OFFICER' | 'VIEWER'

export type User = {
  id: number
  name: string
  email: string
  role: Role
  isActive: boolean
  department?: { id: number; name: string; code: string } | null
}

export async function getUsers() {
  const { data } = await api.get<User[]>('/users')
  return data
}

export async function createUser(payload: {
  name: string
  email: string
  password: string
  role: Role
  departmentId?: number
}) {
  const { data } = await api.post<User>('/users', payload)
  return data
}

export async function updateUser(id: number, payload: { name?: string; email?: string; role?: Role; departmentId?: number | null; isActive?: boolean }) {
  const { data } = await api.patch<User>(`/users/${id}`, payload)
  return data
}

export async function resetUserPassword(id: number, newPassword: string) {
  const { data } = await api.patch<User>(`/users/${id}/password`, { newPassword })
  return data
}