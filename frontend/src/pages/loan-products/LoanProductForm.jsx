import { useState } from 'react'
import api from '../../api/axios'

const DEFAULTS = {
  name: '', description: '', interest_method: 'flat_rate', interest_rate: '',
  repayment_frequency: 'monthly', min_amount: '', max_amount: '', min_term: '',
  max_term: '', term_unit: 'months', processing_fee_type: 'fixed',
  processing_fee_value: '0', late_penalty_type: 'fixed', late_penalty_value: '0',
  grace_period_days: '0', is_active: true,
}

export default function LoanProductForm({ product, onSuccess }) {
  const [form, setForm] = useState(product ? { ...product } : DEFAULTS)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: null }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      if (product) {
        await api.put(`/loan-products/${product.id}`, form)
      } else {
        await api.post('/loan-products', form)
      }
      onSuccess()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
    } finally {
      setSaving(false)
    }
  }

  function Field({ label, name, type = 'text', required }) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          type={type}
          value={form[name]}
          onChange={e => set(name, e.target.value)}
          required={required}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors[name] && <p className="text-xs text-red-600 mt-1">{errors[name][0]}</p>}
      </div>
    )
  }

  function Select({ label, name, options, required }) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select
          value={form[name]}
          onChange={e => set(name, e.target.value)}
          required={required}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
        </select>
        {errors[name] && <p className="text-xs text-red-600 mt-1">{errors[name][0]}</p>}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Product Name *" name="name" required />
      <Field label="Description" name="description" />

      <div className="grid grid-cols-2 gap-4">
        <Select label="Interest Method *" name="interest_method" required options={[
          ['flat_rate', 'Flat Rate'],
          ['reducing_balance', 'Reducing Balance'],
        ]} />
        <Field label="Interest Rate (%) *" name="interest_rate" type="number" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select label="Repayment Frequency *" name="repayment_frequency" required options={[
          ['daily','Daily'],['weekly','Weekly'],['biweekly','Bi-weekly'],
          ['monthly','Monthly'],['quarterly','Quarterly'],
        ]} />
        <Select label="Term Unit *" name="term_unit" required options={[
          ['days','Days'],['weeks','Weeks'],['months','Months'],
        ]} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Min Term *" name="min_term" type="number" required />
        <Field label="Max Term" name="max_term" type="number" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Min Amount (K) *" name="min_amount" type="number" required />
        <Field label="Max Amount (K)" name="max_amount" type="number" />
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Fees & Penalties</p>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Processing Fee Type" name="processing_fee_type" options={[
            ['fixed','Fixed (K)'],['percentage','Percentage (%)'],
          ]} />
          <Field label="Processing Fee Value" name="processing_fee_value" type="number" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Select label="Late Penalty Type" name="late_penalty_type" options={[
            ['fixed','Fixed (K)'],['percentage_of_outstanding','% of Outstanding'],
          ]} />
          <Field label="Late Penalty Value" name="late_penalty_value" type="number" />
        </div>
        <div className="mt-4 max-w-xs">
          <Field label="Grace Period (days)" name="grace_period_days" type="number" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="is_active" checked={form.is_active}
          onChange={e => set('is_active', e.target.checked)}
          className="rounded border-gray-300 text-blue-600" />
        <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
          {saving ? 'Saving…' : product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  )
}
