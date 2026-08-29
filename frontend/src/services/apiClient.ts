// Centralized Axios instance. Every API call in this app goes through
// this client, so we don't scatter raw fetch/axios calls across the UI.
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach the JWT (if present) to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskflow_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If the backend ever returns 401 (expired/invalid token), clear the
// stored session so the app can redirect the user back to login.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('taskflow_token')
      localStorage.removeItem('taskflow_user')
    }
    return Promise.reject(error)
  }
)
