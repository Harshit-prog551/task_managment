import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i)
  const visible = pages.filter(
    (p) => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1
  )

  let prev = null
  const items = []
  for (const p of visible) {
    if (prev !== null && p - prev > 1) {
      items.push(<span key={`ellipsis-${p}`} className="px-2 text-gray-400">…</span>)
    }
    items.push(
      <button
        key={p}
        onClick={() => onPageChange(p)}
        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
          p === page
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        {p + 1}
      </button>
    )
    prev = p
  }

  return (
    <div className="flex items-center gap-1 justify-center mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronLeft />
      </button>
      {items}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronRight />
      </button>
    </div>
  )
}
