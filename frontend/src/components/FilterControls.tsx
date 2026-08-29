import type { TaskFilters, TaskPriority, TaskStatus } from '../types'

interface FilterControlsProps {
  filters: TaskFilters
  onChange: (filters: TaskFilters) => void
}

export default function FilterControls({ filters, onChange }: FilterControlsProps) {
  return (
    <div className="filter-controls">
      <select
        value={filters.status || ''}
        onChange={(e) =>
          onChange({ ...filters, status: (e.target.value || undefined) as TaskStatus })
        }
      >
        <option value="">All statuses</option>
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>

      <select
        value={filters.priority || ''}
        onChange={(e) =>
          onChange({ ...filters, priority: (e.target.value || undefined) as TaskPriority })
        }
      >
        <option value="">All priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>

      <select
        value={filters.sort_by || 'created_at'}
        onChange={(e) =>
          onChange({ ...filters, sort_by: e.target.value as TaskFilters['sort_by'] })
        }
      >
        <option value="created_at">Sort: Created</option>
        <option value="updated_at">Sort: Updated</option>
        <option value="title">Sort: Title</option>
        <option value="priority">Sort: Priority</option>
        <option value="status">Sort: Status</option>
      </select>

      <select
        value={filters.order || 'desc'}
        onChange={(e) => onChange({ ...filters, order: e.target.value as 'asc' | 'desc' })}
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
    </div>
  )
}
