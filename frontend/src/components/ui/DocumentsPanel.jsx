import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, Download, FileText } from 'lucide-react'
import api from '../../api/axios'

const ICON_FOR = (mime = '') => {
  if (mime.includes('pdf'))   return '📄'
  if (mime.includes('image')) return '🖼'
  if (mime.includes('word') || mime.includes('document')) return '📝'
  if (mime.includes('sheet') || mime.includes('excel'))   return '📊'
  return '📎'
}

export default function DocumentsPanel({ entityType, entityId }) {
  const [docs, setDocs]         = useState([])
  const [uploading, setUploading] = useState(false)
  const [name, setName]          = useState('')
  const fileRef                  = useRef()

  async function load() {
    const { data } = await api.get(`/${entityType}s/${entityId}/documents`)
    setDocs(data)
  }

  useEffect(() => { load() }, [entityId])

  async function handleUpload(e) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return

    const fd = new FormData()
    fd.append('file', file)
    if (name.trim()) fd.append('name', name.trim())

    setUploading(true)
    try {
      await api.post(`/${entityType}s/${entityId}/documents`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setName('')
      fileRef.current.value = ''
      load()
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this document?')) return
    await api.delete(`/documents/${id}`)
    load()
  }

  function handleDownload(doc) {
    // Open download via authenticated API link
    const token = localStorage.getItem('token')
    const baseURL = api.defaults.baseURL
    // Build a form POST or use a temporary anchor with auth header via fetch
    fetch(`${baseURL}/documents/${doc.id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob)
        const a   = document.createElement('a')
        a.href     = url
        a.download = doc.name
        a.click()
        URL.revokeObjectURL(url)
      })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-800">Documents ({docs.length})</h2>
      </div>

      {/* Upload form */}
      <form onSubmit={handleUpload} className="px-4 py-3 border-b border-gray-100 flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Document name (optional)</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. ID Copy, Title Deed…"
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">File *</label>
          <input
            type="file"
            ref={fileRef}
            className="w-full text-sm text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
          />
        </div>
        <button type="submit" disabled={uploading}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-60 shrink-0">
          <Plus size={13} /> {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </form>

      {/* List */}
      {docs.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No documents uploaded.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {docs.map(d => (
            <div key={d.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">{ICON_FOR(d.file_type)}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{d.name}</p>
                  <p className="text-xs text-gray-400">
                    {d.uploaded_by?.name || 'Unknown'} &bull; {new Date(d.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleDownload(d)} title="Download"
                  className="text-gray-400 hover:text-blue-600">
                  <Download size={14} />
                </button>
                <button onClick={() => handleDelete(d.id)} title="Delete"
                  className="text-gray-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
