import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { taskApi } from '../api/taskApi'
import { userApi } from '../api/userApi'
import { useAuth } from '../context/AuthContext'
import FileUpload from '../components/FileUpload'
import { FiArrowLeft, FiTrash2, FiDownload } from 'react-icons/fi'

export default function TaskFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    dueDate: '',
    assignedUserId: '',
  })
  const [newFiles, setNewFiles] = useState([])
  const [existingFiles, setExistingFiles] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  useEffect(() => {
    if (isAdmin()) {
      userApi.getAll().then(({ data }) => setUsers(data)).catch(() => {})
    }
    if (isEdit) {
      taskApi.getById(id).then(({ data }) => {
        setForm({
          title: data.title,
          description: data.description || '',
          status: data.status,
          priority: data.priority,
          dueDate: data.dueDate || '',
          assignedUserId: data.assignedUser?.id || '',
        })
        setExistingFiles(data.files || [])
        setFetching(false)
      }).catch(() => {
        toast.error('Task not found')
        navigate('/dashboard')
      })
    }
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        dueDate: form.dueDate || null,
        assignedUserId: form.assignedUserId || null,
      }

      let savedTask
      if (isEdit) {
        const { data } = await taskApi.update(id, payload)
        savedTask = data
      } else {
        const { data } = await taskApi.create(payload)
        savedTask = data
      }

      // Upload new files
      if (newFiles.length > 0) {
        await taskApi.uploadFiles(savedTask.id, newFiles)
      }

      toast.success(isEdit ? 'Task updated!' : 'Task created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteExistingFile = async (fileId) => {
    try {
      await taskApi.deleteFile(id, fileId)
      setExistingFiles(existingFiles.filter((f) => f.id !== fileId))
      toast.success('File removed')
    } catch {
      toast.error('Failed to remove file')
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <FiArrowLeft /> Back
      </button>

      <div className="card">
        <h1 className="text-xl font-bold text-gray-900 mb-6">
          {isEdit ? 'Edit Task' : 'Create New Task'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              className="input"
              placeholder="Task title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Optional description…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select
                className="input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Due Date + Assigned User */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Due Date</label>
              <input
                type="date"
                className="input"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
            {isAdmin() && users.length > 0 && (
              <div>
                <label className="label">Assign To</label>
                <select
                  className="input"
                  value={form.assignedUserId}
                  onChange={(e) => setForm({ ...form, assignedUserId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.email}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Existing files */}
          {isEdit && existingFiles.length > 0 && (
            <div>
              <label className="label">Attached Files</label>
              <ul className="space-y-2">
                {existingFiles.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-sm"
                  >
                    <span className="flex-1 truncate text-gray-700">{f.originalFileName}</span>
                    <a
                      href={taskApi.getFileDownloadUrl(id, f.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <FiDownload size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingFile(f.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* New file upload */}
          <div>
            <label className="label">
              {isEdit ? 'Upload More Files' : 'Attach PDF Files'}
            </label>
            <FileUpload
              files={newFiles}
              onChange={setNewFiles}
              maxFiles={3}
              existingCount={existingFiles.length}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving…' : isEdit ? 'Update Task' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
