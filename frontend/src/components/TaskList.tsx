import type { Task } from '../types'
import TaskCard from './TaskCard'
import LoadingState from './LoadingState'
import ErrorState from './ErrorState'
import EmptyState from './EmptyState'

interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onToggleComplete: (task: Task) => void
  onDelete: (task: Task) => void
}

export default function TaskList({
  tasks,
  isLoading,
  error,
  onRetry,
  onToggleComplete,
  onDelete,
}: TaskListProps) {
  if (isLoading) return <LoadingState message="Loading tasks..." />
  if (error) return <ErrorState message={error} onRetry={onRetry} />
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks found"
        message="Try adjusting your filters, or create a new task to get started."
      />
    )
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
