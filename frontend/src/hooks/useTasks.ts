import { useCallback, useEffect, useState } from 'react'
import type { Task, TaskCreateInput, TaskFilters, TaskUpdateInput } from '../types'
import * as taskService from '../services/taskService'

export function useTasks(filters: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await taskService.fetchTasks(filters)
      setTasks(data)
    } catch (err) {
      setError('Failed to load tasks. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const addTask = async (input: TaskCreateInput) => {
    const newTask = await taskService.createTask(input)
    setTasks((prev) => [newTask, ...prev])
    return newTask
  }

  const editTask = async (id: number, input: TaskUpdateInput) => {
    const updated = await taskService.updateTask(id, input)
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    return updated
  }

  const removeTask = async (id: number) => {
    await taskService.deleteTask(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  return { tasks, isLoading, error, reload: loadTasks, addTask, editTask, removeTask }
}
