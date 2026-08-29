import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types'
import { loginUser, registerUser, clearSession } from '../services/authService'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function loadStoredUser(): User | null {
  const raw = localStorage.getItem('taskflow_user')
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadStoredUser)

  const persistSession = (token: string, loggedInUser: User) => {
    localStorage.setItem('taskflow_token', token)
    localStorage.setItem('taskflow_user', JSON.stringify(loggedInUser))
    setUser(loggedInUser)
  }

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginUser(email, password)
    persistSession(data.access_token, data.user)
  }, [])

  const register = useCallback(
    async (email: string, password: string, fullName?: string) => {
      const data = await registerUser(email, password, fullName)
      persistSession(data.access_token, data.user)
    },
    []
  )

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
