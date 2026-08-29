// Shared TypeScript types, mirroring the backend's Pydantic schemas.

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  created_at: string
  updated_at: string
  user_id: number
}

export interface TaskCreateInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
}

export interface TaskUpdateInput {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
}

export interface User {
  id: number
  email: string
  full_name: string | null
  created_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
  search?: string
  sort_by?: 'created_at' | 'updated_at' | 'title' | 'priority' | 'status'
  order?: 'asc' | 'desc'
}
