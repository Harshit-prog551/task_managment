import { useState, useRef } from 'react'
import { FiUploadCloud, FiX, FiFile } from 'react-icons/fi'

export default function FileUpload({ files, onChange, maxFiles = 3, existingCount = 0 }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()
  const remaining = maxFiles - existingCount - files.length

  const addFiles = (newFiles) => {
    const pdfs = Array.from(newFiles).filter(
      (f) => f.type === 'application/pdf'
    )
    const allowed = pdfs.slice(0, remaining)
    onChange([...files, ...allowed])
  }

  const removeFile = (index) => {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div>
      {/* Drop zone */}
      {remaining > 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            dragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <FiUploadCloud className="mx-auto text-3xl text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            Drop PDF files here or <span className="text-blue-600 font-medium">browse</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PDF only · Max {maxFiles} files · {remaining} remaining
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>
      )}

      {/* Selected files */}
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, i) => (
            <li
              key={i}
              className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100"
            >
              <FiFile className="text-blue-500 shrink-0" />
              <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
              <span className="text-xs text-gray-400">
                {(file.size / 1024).toFixed(1)} KB
              </span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <FiX size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
