import { useEffect, useState } from 'react'
import { Plus, Trash2, CheckCircle } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/ui/Modal'

const TYPES = ['processing_fee', 'insurance', 'other']
const EMPTY = { charge_type: 'processing_fee', name: '', amount: '' }

export default function ChargesPanel({ loanId }) {
  const [items, setItems]     = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(EMPTY)
  const [errors, setErrors]     = useState({})
  const [saving, setSaving]     = useState(false)

  async function load() {
    const { data } = await api.get(`/loans/${loanId}/charges`)
    setItems(data)
  }

  useEffect(() => { load() }, [loanId])

  function openAdd() { setForm(EMPTY); setErrors({}); setShowForm(true) }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true); setErrors({})
    try {
      await api.post(`/loans/${loanId}/charges`, form)
      setShowForm(false); load()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
    } finally { setSaving(false) }
  }

  async function handleMarkPaid(id) {
    await api.post(`/loans/${loanId}/charges/${id}/mark-paid`)
    load()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this charge?')) return
    await api.delete(`/loans/${loanId}/charges/${id}`)
    load()
  }

  function set(f, v) { setForm(p => ({ ...p, [f]: v })); setErrors(e => ({ ...e, [f]: null })) }

  const totalCharges = items.reduce((s, c) => s + Number(c.amount), 0)
  const totalPaid    = items.filter(c => c.is_paid).reduce((s, c) => s + Number(c.amount), 0)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Charges &amp; Fees ({items.length})</h2>
          {totalCharges > 0 && (
            <p className="text-xs text-gray-400">
              Total: K{totalCharges.toLocaleString()} &bull; Paid: K{totalPaid.toLocaleString()}
            </p>
          )}
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
          <Plus size={14} /> Add
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No charges recorded.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map(c => (
            <div key={c.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
              <div className="text-sm min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize shrink-0">
                    {c.charge_type.replace('_', ' ')}
                  </span>
                  <p className="font-medium text-gray-800 truncate">{c.name}</p>
                </div>
                <p className="text-blue-600 font-medium text-xs mt-0.5">
                  K{Number(c.amount).toLocaleString()}
                  {c.is_paid && <span className="ml-2 text-green-600">✓ Paid</span>}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {!c.is_paid && (
                  <button onClick={() => handleMarkPaid(c.id)} title="Mark paid"
                    className="text-gray-400 hover:text-green-600">
                    <CheckCircle size={14} />
                  </button>
                )}
                <button onClick={() => handleDelete(c.id)}
                  className="text-gray-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title="Add Charge / Fee" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
                <select value={form.charge_type} onChange={e => set('charge_type', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {TYPES.map(t => (
                    <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Amount (K) *</label>
                <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount[0]}</p>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Name / Description *</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)} required
                placeholder="e.g. Application fee, Life insurance…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name[0]}</p>}
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Saving…' : 'Add Charge'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
