// All authentication-related API calls live here.
import { apiClient } from './apiClient'
import type { AuthResponse } from '../types'

export async function registerUser(
  email: string,
  password: string,
  fullName?: string
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/auth/register', {
    email,
    password,
    full_name: fullName || undefined,
  })
  return response.data
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/auth/login', {
    email,
    password,
  })
  return response.data
}

// Logout is client-side only: JWTs are stateless, so "logging out" simply
// means discarding the locally stored token. See AuthContext for usage.
export function clearSession(): void {
  localStorage.removeItem('taskflow_token')
  localStorage.removeItem('taskflow_user')
}
