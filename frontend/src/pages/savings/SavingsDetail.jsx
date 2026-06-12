import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowDownCircle, ArrowUpCircle, Lock, Unlock, X, Percent } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/ui/Modal'

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  frozen: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-gray-100 text-gray-500',
}

const TYPE_STYLE = {
  deposit:    'text-green-700',
  withdrawal: 'text-red-600',
  interest:   'text-blue-600',
  fee:        'text-orange-600',
}

const EMPTY_TX = { amount: '', reference: '', notes: '', transaction_date: new Date().toISOString().slice(0, 10) }

export default function SavingsDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null) // 'deposit' | 'withdraw'
  const [form, setForm]       = useState(EMPTY_TX)
  const [errors, setErrors]   = useState({})
  const [saving, setSaving]   = useState(false)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get(`/savings/${id}`)
      setAccount(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  function openModal(type) { setForm(EMPTY_TX); setErrors({}); setModal(type) }

  async function handleTransaction(e) {
    e.preventDefault()
    setSaving(true); setErrors({})
    try {
      await api.post(`/savings/${id}/${modal}`, form)
      setModal(null); load()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
      if (err.response?.status === 422 && err.response.data.message)
        setErrors({ amount: [err.response.data.message] })
    } finally { setSaving(false) }
  }

  async function toggleFreeze() {
    const newStatus = account.status === 'frozen' ? 'active' : 'frozen'
    await api.put(`/savings/${id}`, { status: newStatus })
    load()
  }

  async function handleClose() {
    if (!confirm('Close this savings account?')) return
    await api.put(`/savings/${id}`, { status: 'closed' })
    load()
  }

  async function handlePostInterest() {
    if (!confirm('Post monthly interest to this account now?')) return
    try {
      await api.post(`/savings/${id}/post-interest`)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post interest.')
    }
  }

  function set(f, v) { setForm(p => ({ ...p, [f]: v })); setErrors(e => ({ ...e, [f]: null })) }

  if (loading) return <div className="text-gray-400 text-sm py-10 text-center">Loading…</div>
  if (!account) return null

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/savings')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800 font-mono">{account.account_no}</h1>
            <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[account.status]}`}>
              {account.status}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {account.borrower?.first_name} {account.borrower?.last_name} &bull; {account.product_name}
          </p>
        </div>

        {account.status !== 'closed' && (
          <div className="flex gap-2">
            <button onClick={() => openModal('deposit')}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
              <ArrowDownCircle size={16} /> Deposit
            </button>
            {account.status === 'active' && (
              <>
                <button onClick={() => openModal('withdraw')}
                  className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
                  <ArrowUpCircle size={16} /> Withdraw
                </button>
                {Number(account.interest_rate) > 0 && (
                  <button onClick={handlePostInterest}
                    className="flex items-center gap-2 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm hover:bg-blue-50">
                    <Percent size={15} /> Post Interest
                  </button>
                )}
              </>
            )}
            <button onClick={toggleFreeze}
              className="flex items-center gap-2 border border-gray-300 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
              {account.status === 'frozen' ? <Unlock size={15} /> : <Lock size={15} />}
              {account.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
            </button>
            <button onClick={handleClose}
              className="flex items-center gap-2 border border-red-200 text-red-500 px-3 py-2 rounded-lg text-sm hover:bg-red-50">
              <X size={15} /> Close
            </button>
          </div>
        )}
      </div>

      {/* Balance card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Balance',        value: `K${Number(account.balance).toLocaleString()}`, highlight: true },
          { label: 'Interest Rate',  value: `${account.interest_rate}% p.a.` },
          { label: 'Opened',         value: account.opened_at },
          { label: 'Transactions',   value: account.transactions?.length ?? 0 },
        ].map(c => (
          <div key={c.label} className={`bg-white rounded-xl border p-4 ${c.highlight ? 'border-blue-200' : 'border-gray-200'}`}>
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-xl font-bold ${c.highlight ? 'text-blue-600' : 'text-gray-800'}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">Transaction History</h2>
        </div>
        {account.transactions?.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No transactions yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-2 text-xs text-gray-500">Date</th>
                <th className="text-left px-4 py-2 text-xs text-gray-500">Type</th>
                <th className="text-right px-4 py-2 text-xs text-gray-500">Amount</th>
                <th className="text-right px-4 py-2 text-xs text-gray-500">Balance After</th>
                <th className="text-left px-4 py-2 text-xs text-gray-500">Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {account.transactions.map(t => (
                <tr key={t.id}>
                  <td className="px-4 py-2.5 text-gray-600">{t.transaction_date ? new Date(t.transaction_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td className={`px-4 py-2.5 capitalize font-medium ${TYPE_STYLE[t.type]}`}>{t.type}</td>
                  <td className={`px-4 py-2.5 text-right font-semibold ${TYPE_STYLE[t.type]}`}>
                    {t.type === 'withdrawal' || t.type === 'fee' ? '-' : '+'}K{Number(t.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-700">K{Number(t.balance_after).toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">{t.reference || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Transaction modal */}
      {modal && (
        <Modal
          title={modal === 'deposit' ? 'Record Deposit' : 'Record Withdrawal'}
          onClose={() => setModal(null)}
        >
          <form onSubmit={handleTransaction} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Amount (K) *</label>
                <input type="number" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount[0]}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" value={form.transaction_date} onChange={e => set('transaction_date', e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Reference</label>
              <input type="text" value={form.reference} onChange={e => set('reference', e.target.value)}
                placeholder="Receipt no., mobile money ref…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving}
                className={`text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60 ${
                  modal === 'deposit' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'
                }`}>
                {saving ? 'Saving…' : modal === 'deposit' ? 'Record Deposit' : 'Record Withdrawal'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
