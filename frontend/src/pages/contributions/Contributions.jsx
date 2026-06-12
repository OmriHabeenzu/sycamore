import { useEffect, useState } from 'react'
import { Plus, Trash2, Search } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/ui/Modal'

const K = v => `K${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const EMPTY_FORM = {
  borrower_id: '', amount: '', contribution_date: new Date().toISOString().slice(0, 10),
  reference: '', notes: '',
}

export default function Contributions() {
  const [items, setItems]       = useState([])
  const [meta, setMeta]         = useState({})
  const [members, setMembers]   = useState([])
  const [filters, setFilters]   = useState({ borrower_id: '', date_from: '', date_to: '' })
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [errors, setErrors]     = useState({})
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    api.get('/borrowers', { params: { page: 1 } }).then(r => setMembers(r.data.data))
  }, [])

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/contributions', { params: { ...filters, page } })
      setItems(data.data)
      setMeta(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filters, page])

  function setFilter(f, v) { setFilters(p => ({ ...p, [f]: v })); setPage(1) }
  function set(f, v)       { setForm(p => ({ ...p, [f]: v })); setErrors(e => ({ ...e, [f]: null })) }

  async function handleSubmit(e) {
    e.preventDefault(); setSaving(true); setErrors({})
    try {
      await api.post('/contributions', form)
      setShowForm(false); setForm(EMPTY_FORM); load()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this contribution record?')) return
    await api.delete(`/contributions/${id}`)
    load()
  }

  const total = items.reduce((s, c) => s + Number(c.amount), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contributions</h1>
        <button onClick={() => { setForm(EMPTY_FORM); setErrors({}); setShowForm(true) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Record Contribution
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={filters.borrower_id} onChange={e => setFilter('borrower_id', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Members</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
          ))}
        </select>
        <input type="date" value={filters.date_from} onChange={e => setFilter('date_from', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="date" value={filters.date_to} onChange={e => setFilter('date_to', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {(filters.borrower_id || filters.date_from || filters.date_to) && (
          <button onClick={() => { setFilters({ borrower_id: '', date_from: '', date_to: '' }); setPage(1) }}
            className="text-sm text-gray-500 hover:text-gray-700 px-2">Clear</button>
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-green-700 font-medium">Showing {items.length} records</span>
          <span className="text-lg font-bold text-green-700">{K(total)}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Member</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Member No.</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Reference</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">No contributions found.</td></tr>
            ) : items.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{c.contribution_date}</td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {c.borrower?.first_name} {c.borrower?.last_name}
                </td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{c.borrower?.borrower_no}</td>
                <td className="px-4 py-3 text-right font-semibold text-green-700">{K(c.amount)}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{c.reference || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(c.id)} className="text-gray-300 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
        <Modal title="Record Contribution" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Member *</label>
              <select value={form.borrower_id} onChange={e => set('borrower_id', e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select member…</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.first_name} {m.last_name} ({m.borrower_no})</option>
                ))}
              </select>
              {errors.borrower_id && <p className="text-xs text-red-600 mt-1">{errors.borrower_id[0]}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Amount (K) *</label>
                <input type="number" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount[0]}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" value={form.contribution_date} onChange={e => set('contribution_date', e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Reference</label>
              <input type="text" value={form.reference} onChange={e => set('reference', e.target.value)}
                placeholder="Receipt no., mobile money ref…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Saving…' : 'Record'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
