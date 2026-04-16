export default function FilterBar({ filters, onChange }) {
  const handle = (key, value) => onChange({ ...filters, [key]: value, page: 0 })

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Status */}
      <div>
        <label className="label">Status</label>
        <select
          className="input w-36"
          value={filters.status || ''}
          onChange={(e) => handle('status', e.target.value || undefined)}
        >
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Priority */}
      <div>
        <label className="label">Priority</label>
        <select
          className="input w-32"
          value={filters.priority || ''}
          onChange={(e) => handle('priority', e.target.value || undefined)}
        >
          <option value="">All</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      {/* Due Date */}
      <div>
        <label className="label">Due Date</label>
        <input
          type="date"
          className="input w-40"
          value={filters.dueDate || ''}
          onChange={(e) => handle('dueDate', e.target.value || undefined)}
        />
      </div>

      {/* Sort */}
      <div>
        <label className="label">Sort By</label>
        <select
          className="input w-36"
          value={filters.sortBy || 'id'}
          onChange={(e) => handle('sortBy', e.target.value)}
        >
          <option value="id">Default</option>
          <option value="title">Title</option>
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Sort Dir */}
      <div>
        <label className="label">Order</label>
        <select
          className="input w-28"
          value={filters.sortDir || 'asc'}
          onChange={(e) => handle('sortDir', e.target.value)}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Clear */}
      <button
        className="btn-secondary text-sm"
        onClick={() => onChange({ page: 0, size: 10, sortBy: 'id', sortDir: 'asc' })}
      >
        Clear
      </button>
    </div>
  )
}
