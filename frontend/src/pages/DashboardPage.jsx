import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { taskApi } from '../api/taskApi'
import TaskCard from '../components/TaskCard'
import FilterBar from '../components/FilterBar'
import Pagination from '../components/Pagination'
import { FiLoader, FiInbox } from 'react-icons/fi'

export default function DashboardPage() {
  const [tasks, setTasks] = useState([])
  const [meta, setMeta] = useState({ totalElements: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    page: 0,
    size: 9,
    sortBy: 'id',
    sortDir: 'asc',
  })

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await taskApi.getAll(filters)
      setTasks(data.content)
      setMeta({ totalElements: data.totalElements, totalPages: data.totalPages })
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await taskApi.delete(id)
      toast.success('Task deleted')
      fetchTasks()
    } catch {
      toast.error('Failed to delete task')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {meta.totalElements} task{meta.totalElements !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* Task Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <FiLoader className="animate-spin text-blue-600 text-3xl" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FiInbox className="text-5xl mb-3" />
          <p className="text-lg font-medium">No tasks found</p>
          <p className="text-sm mt-1">Try adjusting your filters or create a new task</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={filters.page}
        totalPages={meta.totalPages}
        onPageChange={(p) => setFilters({ ...filters, page: p })}
      />
    </div>
  )
}
