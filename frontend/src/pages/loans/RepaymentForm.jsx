import { useState } from 'react'
import api from '../../api/axios'

export default function RepaymentForm({ loanId, outstanding, onSuccess }) {
  const [form, setForm] = useState({
    amount:           '',
    payment_date:     new Date().toISOString().split('T')[0],
    payment_method:   'cash',
    reference_number: '',
    notes:            '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: null }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post(`/loans/${loanId}/repayments`, form)
      onSuccess()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
      else alert(err.response?.data?.message || 'Failed to record payment.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-500">
        Outstanding balance: <strong className="text-gray-800">K{Number(outstanding).toLocaleString()}</strong>
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (K) *</label>
          <input type="number" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
          <input type="date" value={form.payment_date} onChange={e => set('payment_date', e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
        <select value={form.payment_method} onChange={e => set('payment_method', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="cash">Cash</option>
          <option value="mobile_money">Mobile Money</option>
          <option value="bank">Bank Transfer</option>
        </select>
      </div>

      {form.payment_method !== 'cash' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
          <input type="text" value={form.reference_number} onChange={e => set('reference_number', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={saving}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
          {saving ? 'Saving…' : 'Record Payment'}
        </button>
      </div>
    </form>
  )
}
