import { useState } from 'react'
import api from '../../api/axios'

const today = new Date().toISOString().split('T')[0]
const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]

export default function DisburseForm({ loanId, onSuccess }) {
  const [form, setForm] = useState({
    disbursement_date:      today,
    first_repayment_date:   nextMonth,
    disbursement_method:    'cash',
    disbursement_reference: '',
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
      await api.post(`/loans/${loanId}/disburse`, form)
      onSuccess()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
      else alert(err.response?.data?.message || 'Disbursement failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Disbursement Date *</label>
          <input type="date" value={form.disbursement_date} onChange={e => set('disbursement_date', e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.disbursement_date && <p className="text-xs text-red-600 mt-1">{errors.disbursement_date[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Repayment Date *</label>
          <input type="date" value={form.first_repayment_date} onChange={e => set('first_repayment_date', e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.first_repayment_date && <p className="text-xs text-red-600 mt-1">{errors.first_repayment_date[0]}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Disbursement Method *</label>
        <select value={form.disbursement_method} onChange={e => set('disbursement_method', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="cash">Cash</option>
          <option value="mobile_money">Mobile Money</option>
          <option value="bank">Bank Transfer</option>
        </select>
      </div>

      {form.disbursement_method !== 'cash' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
          <input type="text" value={form.disbursement_reference} onChange={e => set('disbursement_reference', e.target.value)}
            placeholder="Transaction ref / receipt no."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      )}

      <p className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
        Disbursing will generate the full repayment schedule. This cannot be undone.
      </p>

      <div className="flex justify-end">
        <button type="submit" disabled={saving}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
          {saving ? 'Processing…' : 'Confirm Disbursement'}
        </button>
      </div>
    </form>
  )
}
