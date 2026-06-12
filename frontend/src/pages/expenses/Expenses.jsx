import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/ui/Modal'

const CATEGORIES = ['Salaries', 'Rent', 'Transport', 'Office Supplies', 'Utilities', 'Marketing', 'Other']
const EMPTY = { category: 'Salaries', description: '', amount: '', expense_date: new Date().toISOString().slice(0, 10), reference: '', notes: '' }

export default function Expenses() {
  const [items, setItems]     = useState([])
  const [meta, setMeta]       = useState({})
  const [page, setPage]       = useState(1)
  const [filters, setFilters] = useState({ category: '', date_from: '', date_to: '' })
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]  = useState(null)
  const [form, setForm]        = useState(EMPTY)
  const [errors, setErrors]    = useState({})
  const [saving, setSaving]    = useState(false)

  async function load(p = page) {
    const { data } = await api.get('/expenses', { params: { page: p, ...filters } })
    setItems(data.data)
    setMeta(data.meta || data)
  }

  useEffect(() => { load(1); setPage(1) }, [filters])
  useEffect(() => { load() }, [page])

  function openAdd()   { setForm(EMPTY); setEditing(null); setErrors({}); setShowForm(true) }
  function openEdit(e) { setForm({ ...e }); setEditing(e); setErrors({}); setShowForm(true) }

  async function handleSave(ev) {
    ev.preventDefault()
    setSaving(true); setErrors({})
    try {
      if (editing) await api.put(`/expenses/${editing.id}`, form)
      else         await api.post('/expenses', form)
      setShowForm(false); load(editing ? page : 1)
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this expense?')) return
    await api.delete(`/expenses/${id}`)
    load()
  }

  function set(f, v) { setForm(p => ({ ...p, [f]: v })); setErrors(e => ({ ...e, [f]: null })) }
  function setFilter(f, v) { setFilters(p => ({ ...p, [f]: v })) }

  const totalShown = items.reduce((s, e) => s + Number(e.amount), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select value={filters.category} onChange={e => setFilter('category', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" value={filters.date_from} onChange={e => setFilter('date_from', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="date" value={filters.date_to} onChange={e => setFilter('date_to', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {totalShown > 0 && (
          <div className="ml-auto flex items-center text-sm text-gray-600">
            Total shown: <span className="font-semibold text-gray-800 ml-1">K{totalShown.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Category</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Description</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Ref</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Recorded by</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-sm">No expenses recorded.</td></tr>
            )}
            {items.map(e => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{e.expense_date}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{e.category}</span>
                </td>
                <td className="px-4 py-3 text-gray-800">{e.description}</td>
                <td className="px-4 py-3 text-right font-semibold text-red-600">
                  K{Number(e.amount).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{e.reference || '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{e.created_by?.name || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(e)} className="text-gray-400 hover:text-blue-600"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(e.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 rounded text-sm ${p === page ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              {p}
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Expense' : 'Add Expense'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
                <select value={form.category} onChange={e => set('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Amount (K) *</label>
                <input type="number" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount[0]}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description *</label>
              <input type="text" value={form.description} onChange={e => set('description', e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description[0]}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" value={form.expense_date} onChange={e => set('expense_date', e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Reference</label>
                <input type="text" value={form.reference} onChange={e => set('reference', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Saving…' : editing ? 'Update' : 'Add Expense'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
