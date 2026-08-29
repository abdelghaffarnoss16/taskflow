import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Task, TaskPriority, TaskStatus } from '../types'

export interface TaskFormValues {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
}

interface TaskFormProps {
  initialValues?: Partial<Task>
  submitLabel?: string
  onSubmit: (values: TaskFormValues) => Promise<void> | void
  onCancel?: () => void
}

export default function TaskForm({
  initialValues,
  submitLabel = 'Save',
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialValues?.title || '')
  const [description, setDescription] = useState(initialValues?.description || '')
  const [status, setStatus] = useState<TaskStatus>(initialValues?.status || 'TODO')
  const [priority, setPriority] = useState<TaskPriority>(initialValues?.priority || 'MEDIUM')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setFormError('Title is required.')
      return
    }
    setFormError(null)
    setIsSubmitting(true)
    try {
      await onSubmit({ title: title.trim(), description, status, priority })
    } catch (err) {
      setFormError('Something went wrong while saving the task.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      {formError && <div className="form-error">{formError}</div>}

      <label className="form-field">
        <span>Title</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Write project proposal"
          maxLength={255}
        />
      </label>

      <label className="form-field">
        <span>Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details..."
          rows={4}
        />
      </label>

      <div className="form-row">
        <label className="form-field">
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </label>

        <label className="form-field">
          <span>Priority</span>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </label>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
