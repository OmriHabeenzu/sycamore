import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function SavingsForm({ onSuccess }) {
  const [borrowers, setBorrowers] = useState([])
  const [form, setForm] = useState({
    borrower_id: '', product_name: 'General Savings',
    interest_rate: '', opened_at: new Date().toISOString().slice(0, 10), notes: '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/borrowers', { params: { page: 1 } }).then(r => setBorrowers(r.data.data))
  }, [])

  function set(f, v) { setForm(p => ({ ...p, [f]: v })); setErrors(e => ({ ...e, [f]: null })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setErrors({})
    try {
      await api.post('/savings', form)
      onSuccess()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Member *</label>
        <select value={form.borrower_id} onChange={e => set('borrower_id', e.target.value)} required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Select member…</option>
          {borrowers.map(b => (
            <option key={b.id} value={b.id}>{b.first_name} {b.last_name} ({b.borrower_no})</option>
          ))}
        </select>
        {errors.borrower_id && <p className="text-xs text-red-600 mt-1">{errors.borrower_id[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Product / Account Type</label>
          <input type="text" value={form.product_name} onChange={e => set('product_name', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Interest Rate (% p.a.)</label>
          <input type="number" step="0.01" value={form.interest_rate} onChange={e => set('interest_rate', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Opened Date *</label>
        <input type="date" value={form.opened_at} onChange={e => set('opened_at', e.target.value)} required
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
          {saving ? 'Creating…' : 'Open Account'}
        </button>
      </div>
    </form>
  )
}
