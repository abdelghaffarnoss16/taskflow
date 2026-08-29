import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <NavLink
        to="/dashboard"
        className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
      >
        Dashboard
      </NavLink>
      <NavLink
        to="/tasks"
        className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
      >
        Tasks
      </NavLink>
    </nav>
  )
}
