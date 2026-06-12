import { useState } from 'react'
import api from '../../api/axios'

export default function TopUpForm({ loanId, outstanding, term, onSuccess }) {
  const [form, setForm] = useState({
    top_up_amount: '',
    new_term: term || '',
    first_repayment_date: new Date().toISOString().slice(0, 10),
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function set(f, v) { setForm(p => ({ ...p, [f]: v })); setErrors(e => ({ ...e, [f]: null })) }

  const newBalance = form.top_up_amount ? Number(outstanding) + Number(form.top_up_amount) : Number(outstanding)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!confirm(`This will add K${Number(form.top_up_amount).toLocaleString()} to the loan and regenerate the schedule. Proceed?`)) return
    setSaving(true); setErrors({})
    try {
      await api.post(`/loans/${loanId}/top-up`, form)
      onSuccess()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
        <p className="text-blue-700">Current outstanding balance: <strong>K{Number(outstanding).toLocaleString()}</strong></p>
        {form.top_up_amount && (
          <p className="text-blue-700 mt-1">New balance after top-up: <strong>K{newBalance.toLocaleString()}</strong></p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Top-up Amount (K) *</label>
          <input type="number" step="0.01" value={form.top_up_amount} onChange={e => set('top_up_amount', e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.top_up_amount && <p className="text-xs text-red-600 mt-1">{errors.top_up_amount[0]}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">New Term (periods)</label>
          <input type="number" value={form.new_term} onChange={e => set('new_term', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">First Repayment Date *</label>
        <input type="date" value={form.first_repayment_date} onChange={e => set('first_repayment_date', e.target.value)} required
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
          {saving ? 'Processing…' : 'Apply Top-Up'}
        </button>
      </div>
    </form>
  )
}
