// All task-related API calls live here.
import { apiClient } from './apiClient'
import type { Task, TaskCreateInput, TaskUpdateInput, TaskFilters } from '../types'

export async function fetchTasks(filters: TaskFilters = {}): Promise<Task[]> {
  const params: Record<string, string> = {}
  if (filters.status) params.status = filters.status
  if (filters.priority) params.priority = filters.priority
  if (filters.search) params.search = filters.search
  if (filters.sort_by) params.sort_by = filters.sort_by
  if (filters.order) params.order = filters.order

  const response = await apiClient.get<Task[]>('/api/tasks', { params })
  return response.data
}

export async function fetchTask(id: number): Promise<Task> {
  const response = await apiClient.get<Task>(`/api/tasks/${id}`)
  return response.data
}

export async function createTask(input: TaskCreateInput): Promise<Task> {
  const response = await apiClient.post<Task>('/api/tasks', input)
  return response.data
}

export async function updateTask(id: number, input: TaskUpdateInput): Promise<Task> {
  const response = await apiClient.put<Task>(`/api/tasks/${id}`, input)
  return response.data
}

export async function deleteTask(id: number): Promise<void> {
  await apiClient.delete(`/api/tasks/${id}`)
}
