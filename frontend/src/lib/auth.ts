import { api } from './api'

export type Role = 'ADMIN' | 'OFFICER' | 'VIEWER'

export type LoginResponse = {
  accessToken: string
  user: {
    id: number
    name: string
    email: string
    role: Role
    departmentId: number | null
  }
}

export async function login(email: string, password: string) {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password })
  localStorage.setItem('accessToken', data.accessToken)
  return data
}

export async function me() {
  // your /auth/me returns payload from jwt strategy
  const { data } = await api.get<{ sub: number; email: string; role: Role; departmentId: number | null }>(
    '/auth/me'
  )
  return data
}

export function logout() {
  localStorage.removeItem('accessToken')
}