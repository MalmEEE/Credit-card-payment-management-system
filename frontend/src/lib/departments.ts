import { api } from './api'

export type Department = {
  id: number
  name: string
  code: string
  limitUsd: string
}

export async function getDepartments() {
  const { data } = await api.get<Department[]>('/departments')
  return data
}

export async function createDepartment(payload: { name: string; code: string; limitUsd?: number }) {
  const { data } = await api.post<Department>('/departments', payload)
  return data
}

export async function updateDepartmentLimit(id: number, limitUsd: number) {
  const { data } = await api.put<Department>(`/departments/${id}/limit`, { limitUsd })
  return data
}