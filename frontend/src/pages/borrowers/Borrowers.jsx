import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Eye, Trash2 } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/ui/Modal'
import BorrowerForm from './BorrowerForm'

export default function Borrowers() {
  const navigate = useNavigate()
  const [borrowers, setBorrowers] = useState([])
  const [meta, setMeta] = useState({})
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/borrowers', { params: { search, page } })
      setBorrowers(data.data)
      setMeta(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search, page])

  async function handleDelete(id) {
    if (!confirm('Delete this member?')) return
    await api.delete(`/borrowers/${id}`)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Members</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Add Member
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search name, phone, ID…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">No.</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">National ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">City</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading…</td></tr>
            ) : borrowers.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">No members found.</td></tr>
            ) : borrowers.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{b.borrower_no}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{b.first_name} {b.last_name}</td>
                <td className="px-4 py-3 text-gray-600">{b.phone}</td>
                <td className="px-4 py-3 text-gray-600">{b.national_id || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{b.city || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => navigate(`/borrowers/${b.id}`)} className="text-gray-400 hover:text-blue-600"><Eye size={16} /></button>
                    <button onClick={() => handleDelete(b.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
            <span>Page {meta.current_page} of {meta.last_page}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50">Prev</button>
              <button disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <Modal title="Add Member" onClose={() => setShowForm(false)}>
          <BorrowerForm onSuccess={() => { setShowForm(false); load() }} />
        </Modal>
      )}
    </div>
  )
}
