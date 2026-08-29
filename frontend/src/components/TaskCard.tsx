import { Link } from 'react-router-dom'
import type { Task } from '../types'

const statusLabels: Record<Task['status'], string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
}

interface TaskCardProps {
  task: Task
  onToggleComplete: (task: Task) => void
  onDelete: (task: Task) => void
}

export default function TaskCard({ task, onToggleComplete, onDelete }: TaskCardProps) {
  return (
    <div className={`task-card priority-${task.priority.toLowerCase()}`}>
      <div className="task-card-main">
        <label className="task-checkbox">
          <input
            type="checkbox"
            checked={task.status === 'DONE'}
            onChange={() => onToggleComplete(task)}
          />
        </label>

        <div className="task-card-body">
          <Link to={`/tasks/${task.id}`} className="task-title">
            {task.title}
          </Link>
          {task.description && <p className="task-description">{task.description}</p>}
          <div className="task-meta">
            <span className={`badge badge-status-${task.status.toLowerCase()}`}>
              {statusLabels[task.status]}
            </span>
            <span className={`badge badge-priority-${task.priority.toLowerCase()}`}>
              {task.priority}
            </span>
          </div>
        </div>
      </div>

      <div className="task-card-actions">
        <Link to={`/tasks/${task.id}`} className="btn btn-secondary btn-small">
          Edit
        </Link>
        <button className="btn btn-danger btn-small" onClick={() => onDelete(task)}>
          Delete
        </button>
      </div>
    </div>
  )
}
