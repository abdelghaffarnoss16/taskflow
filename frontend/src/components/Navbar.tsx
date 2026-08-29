import { useAuth } from '../hooks/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="navbar-brand">TaskFlow</div>
      <div className="navbar-user">
        {user && <span className="navbar-email">{user.email}</span>}
        <button className="btn btn-secondary btn-small" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  )
}
