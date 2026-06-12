import { useEffect, useState } from 'react'
import { Loader, ChevronDown, ChevronUp, Plus, X, AlertCircle } from 'lucide-react'
import api from '../../api/axios'

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700',
  approved:  'bg-blue-100 text-blue-700',
  active:    'bg-green-100 text-green-700',
  closed:    'bg-gray-100 text-gray-500',
  defaulted: 'bg-red-100 text-red-700',
  rejected:  'bg-red-50 text-red-400',
}

const SCHED_COLORS = {
  pending: 'text-gray-500',
  partial: 'text-amber-600',
  paid:    'text-green-600',
  overdue: 'text-red-600 font-semibold',
}

const fmt     = n => `K${Number(n || 0).toLocaleString()}`
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB') : '—'

function ApplyModal({ savingsBalance, onClose, onSuccess }) {
  const [products, setProducts]   = useState([])
  const [selected, setSelected]   = useState(null)
  const [amount, setAmount]       = useState('')
  const [term, setTerm]           = useState('')
  const [notes, setNotes]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState(null)

  const maxFromSavings = savingsBalance * 3

  useEffect(() => {
    api.get('/loan-products').then(r => {
      const list = (r.data.data || r.data || []).filter(p => p.is_active)
      setProducts(list)
      if (list.length === 1) setSelected(list[0])
    })
  }, [])

  const maxAmount = selected
    ? Math.min(maxFromSavings || Infinity, selected.max_amount || Infinity)
    : maxFromSavings

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await api.post('/my/loans', {
        loan_product_id:  selected.id,
        principal_amount: parseFloat(amount),
        term:             parseInt(term),
        notes,
      })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Apply for a Loan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {savingsBalance === 0 && (
          <div className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 flex gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            You have no savings balance. Deposit into savings first to qualify for a loan.
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Loan Product *</label>
            <select value={selected?.id || ''} onChange={e => setSelected(products.find(p => p.id === +e.target.value))}
              required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="">Select a product</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {selected && (
              <p className="text-xs text-gray-400 mt-1">
                {selected.interest_rate}% {selected.interest_method === 'flat_rate' ? 'flat' : 'reducing'} · {selected.repayment_frequency} repayments
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Amount (ZMW) *</label>
            <input type="number" min={selected?.min_amount || 1} max={maxAmount || undefined}
              value={amount} onChange={e => setAmount(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              {selected?.min_amount ? <span>Min: {fmt(selected.min_amount)}</span> : <span />}
              {maxFromSavings > 0 ? (
                <span className="text-emerald-600 font-medium">Max (3× savings): {fmt(maxFromSavings)}</span>
              ) : <span />}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Term ({selected?.term_unit || 'months'}) *
            </label>
            <input type="number" min={selected?.min_term || 1} max={selected?.max_term || undefined}
              value={term} onChange={e => setTerm(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            {selected && (
              <p className="text-xs text-gray-400 mt-1">
                {selected.min_term}–{selected.max_term} {selected.term_unit}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Purpose / Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="What is this loan for?"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting || !selected}
              className="flex-1 bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-800 disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <Loader size={15} className="animate-spin" /> : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MemberLoans() {
  const [loans, setLoans]       = useState([])
  const [savingsBalance, setSavingsBalance] = useState(0)
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [showApply, setShowApply] = useState(false)

  function load() {
    Promise.all([
      api.get('/my/loans'),
      api.get('/my/dashboard'),
    ]).then(([loansRes, dashRes]) => {
      setLoans(loansRes.data.data || [])
      setSavingsBalance(dashRes.data.savings_balance || 0)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader className="w-7 h-7 animate-spin text-emerald-500" />
    </div>
  )

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Loans</h1>
          {savingsBalance > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              Savings: {fmt(savingsBalance)} · Max loan: {fmt(savingsBalance * 3)}
            </p>
          )}
        </div>
        <button onClick={() => setShowApply(true)}
          className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-800">
          <Plus size={16} /> Apply for Loan
        </button>
      </div>

      {loans.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="mb-3">No loans on your account.</p>
          <button onClick={() => setShowApply(true)}
            className="text-emerald-600 hover:underline text-sm font-medium">
            Apply for your first loan →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map(loan => (
            <div key={loan.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-4 cursor-pointer"
                onClick={() => setExpanded(expanded === loan.id ? null : loan.id)}>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-gray-700">{loan.loan_no}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[loan.status] || ''}`}>
                      {loan.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{loan.loan_product?.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{fmt(loan.principal_amount)}</div>
                  <div className="text-xs text-gray-400">Outstanding: {fmt(loan.outstanding_balance)}</div>
                </div>
                {expanded === loan.id
                  ? <ChevronUp size={16} className="text-gray-400" />
                  : <ChevronDown size={16} className="text-gray-400" />}
              </div>

              {loan.status === 'pending' && (
                <div className="px-5 pb-3 -mt-1">
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    Your application is under review. You will be notified once it is processed.
                  </span>
                </div>
              )}

              {expanded === loan.id && loan.schedule?.length > 0 && (
                <div className="border-t border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                      <tr>
                        <th className="px-4 py-2 text-left">#</th>
                        <th className="px-4 py-2 text-left">Due Date</th>
                        <th className="px-4 py-2 text-right">Principal</th>
                        <th className="px-4 py-2 text-right">Interest</th>
                        <th className="px-4 py-2 text-right">Total</th>
                        <th className="px-4 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {loan.schedule.map(s => (
                        <tr key={s.id} className={s.status === 'overdue' ? 'bg-red-50' : ''}>
                          <td className="px-4 py-2 text-gray-500">{s.installment_no}</td>
                          <td className="px-4 py-2">{fmtDate(s.due_date)}</td>
                          <td className="px-4 py-2 text-right">{fmt(s.principal_due)}</td>
                          <td className="px-4 py-2 text-right">{fmt(s.interest_due)}</td>
                          <td className="px-4 py-2 text-right font-medium">{fmt(s.total_due)}</td>
                          <td className={`px-4 py-2 capitalize text-xs ${SCHED_COLORS[s.status] || ''}`}>{s.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showApply && (
        <ApplyModal
          savingsBalance={savingsBalance}
          onClose={() => setShowApply(false)}
          onSuccess={() => { setShowApply(false); setLoading(true); load() }}
        />
      )}
    </div>
  )
}
