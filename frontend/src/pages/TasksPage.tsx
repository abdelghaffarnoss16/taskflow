import { useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import type { Task, TaskFilters } from '../types'
import TaskList from '../components/TaskList'
import SearchBar from '../components/SearchBar'
import FilterControls from '../components/FilterControls'
import TaskForm from '../components/TaskForm'
import type { TaskFormValues } from '../components/TaskForm'

export default function TasksPage() {
  const [filters, setFilters] = useState<TaskFilters>({
    sort_by: 'created_at',
    order: 'desc',
  })
  const [isCreating, setIsCreating] = useState(false)

  const { tasks, isLoading, error, reload, addTask, editTask, removeTask } =
    useTasks(filters)

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query || undefined }))
  }

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE'
    await editTask(task.id, { status: newStatus })
  }

  const handleDelete = async (task: Task) => {
    if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
      await removeTask(task.id)
    }
  }

  const handleCreate = async (values: TaskFormValues) => {
    await addTask(values)
    setIsCreating(false)
  }

  return (
    <div className="tasks-page">
      <div className="tasks-page-header">
        <h1>Tasks</h1>
        <button className="btn btn-primary" onClick={() => setIsCreating((v) => !v)}>
          {isCreating ? 'Close' : '+ New Task'}
        </button>
      </div>

      {isCreating && (
        <div className="task-form-panel">
          <TaskForm
            submitLabel="Create Task"
            onSubmit={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}

      <div className="tasks-toolbar">
        <SearchBar onSearch={handleSearch} />
        <FilterControls filters={filters} onChange={setFilters} />
      </div>

      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDelete}
      />
    </div>
  )
}
