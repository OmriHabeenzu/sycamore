import { useEffect, useState } from 'react'
import { Loader, PiggyBank, ArrowDownCircle, X, Clock, CheckCircle, XCircle } from 'lucide-react'
import api from '../../api/axios'

const fmt     = n => `K${Number(n || 0).toLocaleString()}`
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const REQUEST_STATUS = {
  pending:  { label: 'Pending',  color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700',   icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600',       icon: XCircle },
}

function WithdrawModal({ account, onClose, onSuccess }) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]   = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (parseFloat(amount) > account.balance) {
      setError('Amount exceeds your available balance.')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/withdrawal-requests', {
        savings_account_id: account.id,
        amount: parseFloat(amount),
        reason,
      })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Request Withdrawal</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-emerald-50 rounded-lg px-4 py-3 text-sm">
            <span className="text-gray-500">Available balance: </span>
            <span className="font-bold text-emerald-700">{fmt(account.balance)}</span>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Amount (ZMW) *</label>
            <input type="number" min={1} max={account.balance} step="0.01"
              value={amount} onChange={e => setAmount(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
              placeholder="Why are you withdrawing?"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
          </div>
          <p className="text-xs text-gray-400">
            Withdrawal requests are reviewed by the office. Funds are only released after approval.
          </p>
          {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-800 disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <Loader size={15} className="animate-spin" /> : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MemberSavings() {
  const [accounts, setAccounts]   = useState([])
  const [requests, setRequests]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [withdrawFor, setWithdrawFor] = useState(null)

  function load() {
    Promise.all([
      api.get('/my/savings'),
      api.get('/my/withdrawal-requests'),
    ]).then(([savRes, wrRes]) => {
      setAccounts(savRes.data.data || [])
      setRequests(wrRes.data.data || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader className="w-7 h-7 animate-spin text-emerald-500" />
    </div>
  )

  // Pending request per account — disable button if already has one
  const pendingAccountIds = new Set(
    requests.filter(r => r.status === 'pending').map(r => r.savings_account_id)
  )

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Savings</h1>

      {accounts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No savings accounts yet.</div>
      ) : accounts.map(acc => (
        <div key={acc.id} className="bg-white rounded-xl border border-gray-100 shadow-sm mb-5">
          <div className="px-5 py-4 flex items-center gap-4 border-b border-gray-50">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <PiggyBank size={18} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{acc.product_name || 'Savings Account'}</div>
              <div className="text-xs text-gray-400">{acc.account_no}</div>
            </div>
            <div className="text-right mr-4">
              <div className="text-2xl font-bold text-emerald-700">{fmt(acc.balance)}</div>
              <div className="text-xs text-gray-400">Balance</div>
            </div>
            <button
              onClick={() => setWithdrawFor(acc)}
              disabled={pendingAccountIds.has(acc.id)}
              title={pendingAccountIds.has(acc.id) ? 'A withdrawal request is already pending' : 'Request withdrawal'}
              className="flex items-center gap-1.5 border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
              <ArrowDownCircle size={14} /> Withdraw
            </button>
          </div>

          {acc.transactions?.length > 0 && (
            <div>
              <div className="px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                Recent Transactions
              </div>
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 border-b border-gray-50">
                  <tr>
                    <th className="px-5 py-2 text-left">Date</th>
                    <th className="px-5 py-2 text-left">Type</th>
                    <th className="px-5 py-2 text-left">Notes</th>
                    <th className="px-5 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {acc.transactions.map(t => (
                    <tr key={t.id}>
                      <td className="px-5 py-2 text-gray-500">{fmtDate(t.transaction_date || t.created_at)}</td>
                      <td className="px-5 py-2 capitalize text-gray-600">{t.type}</td>
                      <td className="px-5 py-2 text-gray-400 text-xs">{t.notes || '—'}</td>
                      <td className={`px-5 py-2 text-right font-medium ${t.type === 'deposit' ? 'text-green-600' : 'text-red-500'}`}>
                        {t.type === 'deposit' ? '+' : '-'}{fmt(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {/* Withdrawal requests history */}
      {requests.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Withdrawal Requests</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-left">Reason</th>
                  <th className="px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.map(r => {
                  const st = REQUEST_STATUS[r.status] || REQUEST_STATUS.pending
                  const Icon = st.icon
                  return (
                    <tr key={r.id}>
                      <td className="px-5 py-3 text-gray-500">{fmtDate(r.created_at)}</td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-900">{fmt(r.amount)}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{r.reason || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>
                          <Icon size={11} /> {st.label}
                        </span>
                        {r.review_notes && (
                          <div className="text-xs text-gray-400 mt-0.5">{r.review_notes}</div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {withdrawFor && (
        <WithdrawModal
          account={withdrawFor}
          onClose={() => setWithdrawFor(null)}
          onSuccess={() => { setWithdrawFor(null); setLoading(true); load() }}
        />
      )}
    </div>
  )
}
