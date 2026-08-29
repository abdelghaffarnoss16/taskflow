import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/AuthContext'
import { useTasks } from '../hooks/useTasks'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'

export default function DashboardPage() {
  const { user } = useAuth()
  const { tasks, isLoading, error, reload } = useTasks({
    sort_by: 'created_at',
    order: 'desc',
  })

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'TODO').length,
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      done: tasks.filter((t) => t.status === 'DONE').length,
    }
  }, [tasks])

  const recentTasks = tasks.slice(0, 5)

  if (isLoading) return <LoadingState message="Loading your dashboard..." />
  if (error) return <ErrorState message={error} onRetry={reload} />

  return (
    <div className="dashboard-page">
      <h1>Welcome{user?.full_name ? `, ${user.full_name}` : ''}</h1>
      <p className="page-subtitle">Here's an overview of your tasks.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total tasks</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.todo}</span>
          <span className="stat-label">To Do</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.inProgress}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.done}</span>
          <span className="stat-label">Done</span>
        </div>
      </div>

      <div className="dashboard-recent">
        <div className="dashboard-recent-header">
          <h2>Recent tasks</h2>
          <Link to="/tasks" className="btn btn-secondary btn-small">
            View all
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <p className="page-subtitle">You don't have any tasks yet.</p>
        ) : (
          <ul className="recent-task-list">
            {recentTasks.map((task) => (
              <li key={task.id}>
                <Link to={`/tasks/${task.id}`}>{task.title}</Link>
                <span className={`badge badge-status-${task.status.toLowerCase()}`}>
                  {task.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
