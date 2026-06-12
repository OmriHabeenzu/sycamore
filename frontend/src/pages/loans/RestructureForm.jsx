import { useState } from 'react'
import api from '../../api/axios'

const FREQUENCIES = ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly']

export default function RestructureForm({ loanId, loan, onSuccess }) {
  const [form, setForm] = useState({
    new_term: loan.term || '',
    new_interest_rate: loan.interest_rate || '',
    new_frequency: loan.repayment_frequency || 'monthly',
    first_repayment_date: new Date().toISOString().slice(0, 10),
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function set(f, v) { setForm(p => ({ ...p, [f]: v })); setErrors(e => ({ ...e, [f]: null })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!confirm('This will regenerate the repayment schedule with the new terms. Proceed?')) return
    setSaving(true); setErrors({})
    try {
      await api.post(`/loans/${loanId}/restructure`, form)
      onSuccess()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
        Outstanding balance <strong>K{Number(loan.outstanding_balance).toLocaleString()}</strong> will be rescheduled under the new terms.
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">New Term (periods) *</label>
          <input type="number" value={form.new_term} onChange={e => set('new_term', e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.new_term && <p className="text-xs text-red-600 mt-1">{errors.new_term[0]}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">New Interest Rate (%)</label>
          <input type="number" step="0.01" value={form.new_interest_rate} onChange={e => set('new_interest_rate', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">New Frequency</label>
          <select value={form.new_frequency} onChange={e => set('new_frequency', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {FREQUENCIES.map(f => (
              <option key={f} value={f} className="capitalize">{f.charAt(0).toUpperCase() + f.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">First Repayment Date *</label>
          <input type="date" value={form.first_repayment_date} onChange={e => set('first_repayment_date', e.target.value)} required
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
          className="bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-60">
          {saving ? 'Processing…' : 'Restructure Loan'}
        </button>
      </div>
    </form>
  )
}
