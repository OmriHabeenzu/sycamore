import { useEffect, useState } from 'react'
import api from '../../api/axios'

const EMPTY = {
  borrower_id: '', loan_product_id: '', loan_officer_id: '',
  principal_amount: '', interest_rate: '', interest_method: 'flat_rate',
  repayment_frequency: 'monthly', term: '', term_unit: 'months',
  application_date: new Date().toISOString().split('T')[0], notes: '',
}

export default function LoanForm({ onSuccess }) {
  const [form, setForm] = useState(EMPTY)
  const [borrowers, setBorrowers] = useState([])
  const [products, setProducts] = useState([])
  const [officers, setOfficers] = useState([])
  const [preview, setPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [previewing, setPreviewing] = useState(false)

  useEffect(() => {
    api.get('/borrowers', { params: { page: 1 } }).then(r => setBorrowers(r.data.data))
    api.get('/loan-products').then(r => setProducts(r.data))
  }, [])

  // Auto-fill from product when selected
  function handleProductChange(productId) {
    const product = products.find(p => p.id === Number(productId))
    if (product) {
      setForm(f => ({
        ...f,
        loan_product_id:     productId,
        interest_rate:       product.interest_rate,
        interest_method:     product.interest_method,
        repayment_frequency: product.repayment_frequency,
        term_unit:           product.term_unit,
      }))
    } else {
      setForm(f => ({ ...f, loan_product_id: productId }))
    }
    setPreview(null)
  }

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: null }))
    setPreview(null)
  }

  async function handlePreview() {
    if (!form.principal_amount || !form.term || !form.interest_rate) return
    setPreviewing(true)
    try {
      const today = new Date()
      today.setMonth(today.getMonth() + 1)
      const firstRepayment = today.toISOString().split('T')[0]

      const { data } = await api.post('/loans/preview-schedule', {
        principal_amount:     form.principal_amount,
        interest_rate:        form.interest_rate,
        interest_method:      form.interest_method,
        repayment_frequency:  form.repayment_frequency,
        term:                 form.term,
        first_repayment_date: firstRepayment,
      })
      setPreview(data)
    } catch {}
    setPreviewing(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      await api.post('/loans', form)
      onSuccess()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
    } finally {
      setSaving(false)
    }
  }

  function FieldError({ name }) {
    return errors[name] ? <p className="text-xs text-red-600 mt-1">{errors[name][0]}</p> : null
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Borrower */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Borrower *</label>
        <select value={form.borrower_id} onChange={e => set('borrower_id', e.target.value)} required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">— Select borrower —</option>
          {borrowers.map(b => (
            <option key={b.id} value={b.id}>{b.first_name} {b.last_name} ({b.borrower_no})</option>
          ))}
        </select>
        <FieldError name="borrower_id" />
      </div>

      {/* Loan Product */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Loan Product *</label>
        <select value={form.loan_product_id} onChange={e => handleProductChange(e.target.value)} required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">— Select product —</option>
          {products.filter(p => p.is_active).map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <FieldError name="loan_product_id" />
      </div>

      {/* Amount + Term */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Principal (K) *</label>
          <input type="number" value={form.principal_amount} onChange={e => set('principal_amount', e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <FieldError name="principal_amount" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%) *</label>
          <input type="number" step="0.01" value={form.interest_rate} onChange={e => set('interest_rate', e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <FieldError name="interest_rate" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Term *</label>
          <input type="number" value={form.term} onChange={e => set('term', e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <FieldError name="term" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
          <select value={form.term_unit} onChange={e => set('term_unit', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
          <select value={form.repayment_frequency} onChange={e => set('repayment_frequency', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Interest Method</label>
          <select value={form.interest_method} onChange={e => set('interest_method', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="flat_rate">Flat Rate</option>
            <option value="reducing_balance">Reducing Balance</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Application Date</label>
          <input type="date" value={form.application_date} onChange={e => set('application_date', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Schedule Preview */}
      <div>
        <button type="button" onClick={handlePreview} disabled={previewing}
          className="text-sm text-blue-600 hover:underline disabled:opacity-50">
          {previewing ? 'Calculating…' : 'Preview repayment schedule'}
        </button>
      </div>

      {preview && (
        <div className="border border-gray-200 rounded-lg overflow-hidden text-sm">
          <div className="bg-gray-50 px-4 py-2 flex gap-6 text-xs text-gray-600 font-medium border-b border-gray-200">
            <span>Total Interest: <strong>K{Number(preview.total_interest).toLocaleString()}</strong></span>
            <span>Total Due: <strong>K{Number(preview.total_amount_due).toLocaleString()}</strong></span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2 text-gray-500">#</th>
                  <th className="text-left px-3 py-2 text-gray-500">Due Date</th>
                  <th className="text-right px-3 py-2 text-gray-500">Principal</th>
                  <th className="text-right px-3 py-2 text-gray-500">Interest</th>
                  <th className="text-right px-3 py-2 text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.installments.map((row, i) => (
                  <tr key={i}>
                    <td className="px-3 py-1.5 text-gray-500">{row.installment_no}</td>
                    <td className="px-3 py-1.5">{row.due_date}</td>
                    <td className="px-3 py-1.5 text-right">K{Number(row.principal_due).toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right">K{Number(row.interest_due).toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right font-medium">K{Number(row.total_due).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={saving}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
          {saving ? 'Submitting…' : 'Submit Application'}
        </button>
      </div>
    </form>
  )
}
