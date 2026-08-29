import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Task } from '../types'
import * as taskService from '../services/taskService'
import TaskForm from '../components/TaskForm'
import type { TaskFormValues } from '../components/TaskForm'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'

export default function TaskDetailsPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()

  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTask = async () => {
    if (!taskId) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await taskService.fetchTask(Number(taskId))
      setTask(data)
    } catch (err) {
      setError('Could not load this task. It may not exist or you may not have access to it.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTask()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId])

  const handleUpdate = async (values: TaskFormValues) => {
    if (!task) return
    const updated = await taskService.updateTask(task.id, values)
    setTask(updated)
    navigate('/tasks')
  }

  const handleDelete = async () => {
    if (!task) return
    if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
      await taskService.deleteTask(task.id)
      navigate('/tasks')
    }
  }

  if (isLoading) return <LoadingState message="Loading task..." />
  if (error) return <ErrorState message={error} onRetry={loadTask} />
  if (!task) return null

  return (
    <div className="task-details-page">
      <div className="tasks-page-header">
        <h1>Edit Task</h1>
        <button className="btn btn-danger" onClick={handleDelete}>
          Delete Task
        </button>
      </div>

      <div className="task-form-panel">
        <TaskForm
          initialValues={task}
          submitLabel="Save Changes"
          onSubmit={handleUpdate}
          onCancel={() => navigate('/tasks')}
        />
      </div>
    </div>
  )
}
