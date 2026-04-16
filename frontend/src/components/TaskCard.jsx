import { useNavigate } from 'react-router-dom'
import { FiEdit2, FiTrash2, FiPaperclip, FiUser, FiCalendar } from 'react-icons/fi'

const statusClass = {
  PENDING: 'badge-pending',
  IN_PROGRESS: 'badge-in-progress',
  COMPLETED: 'badge-completed',
}

const priorityClass = {
  LOW: 'badge-low',
  MEDIUM: 'badge-medium',
  HIGH: 'badge-high',
}

export default function TaskCard({ task, onDelete }) {
  const navigate = useNavigate()

  return (
    <div className="card hover:shadow-md transition-shadow group">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2">{task.title}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => navigate(`/tasks/${task.id}/edit`)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FiEdit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={statusClass[task.status] || 'badge-pending'}>
          {task.status?.replace('_', ' ')}
        </span>
        <span className={priorityClass[task.priority] || 'badge-medium'}>
          {task.priority}
        </span>
      </div>

      {/* Footer meta */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-auto pt-3 border-t border-gray-50">
        {task.assignedUser && (
          <span className="flex items-center gap-1">
            <FiUser size={11} />
            {task.assignedUser.email}
          </span>
        )}
        {task.dueDate && (
          <span className="flex items-center gap-1">
            <FiCalendar size={11} />
            {task.dueDate}
          </span>
        )}
        {task.files?.length > 0 && (
          <span className="flex items-center gap-1">
            <FiPaperclip size={11} />
            {task.files.length} file{task.files.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}
