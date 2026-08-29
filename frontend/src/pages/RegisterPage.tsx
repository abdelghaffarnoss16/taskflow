import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    setIsSubmitting(true)
    try {
      await register(email, password, fullName || undefined)
      navigate('/dashboard')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      setError(detail || 'Could not create your account. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>TaskFlow</h1>
        <p className="auth-subtitle">Create your account</p>

        {error && <div className="form-error">{error}</div>}

        <label className="form-field">
          <span>Full name (optional)</span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoFocus
          />
        </label>

        <label className="form-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="form-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>

        <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Register'}
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  )
}
