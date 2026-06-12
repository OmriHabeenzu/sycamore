import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/ui/Modal'

const K = v => `K${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const TX_COLORS = {
  purchase:   'text-green-700',
  dividend:   'text-blue-600',
  withdrawal: 'text-red-600',
  adjustment: 'text-orange-500',
}

const EMPTY_SETUP = { amount_per_share: '', joined_date: new Date().toISOString().slice(0, 10), notes: '' }
const EMPTY_BUY   = { shares: '', amount: '', transaction_date: new Date().toISOString().slice(0, 10), reference: '', notes: '' }

const INPUT = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const LABEL = 'block text-xs font-medium text-gray-700 mb-1'

export default function SharesPanel({ memberId }) {
  const [data, setData]         = useState(null)
  const [loaded, setLoaded]     = useState(false)
  const [modal, setModal]       = useState(null) // 'setup' | 'purchase'
  const [form, setForm]         = useState({})
  const [errors, setErrors]     = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving]     = useState(false)

  async function load() {
    const { data: res } = await api.get(`/members/${memberId}/shares`)
    setData(res)
    setLoaded(true)
  }

  useEffect(() => { load() }, [memberId])

  function open(type) {
    setForm(type === 'setup' ? EMPTY_SETUP : EMPTY_BUY)
    setErrors({})
    setServerError('')
    setModal(type)
  }

  function set(f, v) {
    setForm(p => ({ ...p, [f]: v }))
    setErrors(e => ({ ...e, [f]: null }))
    setServerError('')
  }

  async function handleSetup(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    setServerError('')
    try {
      await api.post(`/members/${memberId}/shares`, form)
      setModal(null)
      load()
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        setServerError(err.response?.data?.message || err.message || 'Something went wrong.')
      }
    } finally { setSaving(false) }
  }

  async function handlePurchase(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    setServerError('')
    try {
      await api.post(`/members/${memberId}/shares/purchase`, form)
      setModal(null)
      load()
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        setServerError(err.response?.data?.message || err.message || 'Something went wrong.')
      }
    } finally { setSaving(false) }
  }

  if (!loaded) return <div className="text-gray-400 text-sm py-10 text-center">Loading…</div>

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-sm font-medium text-gray-700 mb-1">No share account yet</p>
        <p className="text-xs text-gray-400 mb-5">Open a share account to start tracking this member's shares.</p>
        <button onClick={() => open('setup')}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          Open Share Account
        </button>

        {modal === 'setup' && (
          <Modal title="Open Share Account" onClose={() => setModal(null)}>
            <form onSubmit={handleSetup} className="space-y-3">
              {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                  {serverError}
                </div>
              )}
              <div>
                <label className={LABEL}>Share Price (K per share) *</label>
                <input type="number" step="0.01" value={form.amount_per_share}
                  onChange={e => set('amount_per_share', e.target.value)} required className={INPUT} />
                {errors.amount_per_share && <p className="text-xs text-red-600 mt-1">{errors.amount_per_share[0]}</p>}
              </div>
              <div>
                <label className={LABEL}>Member Join Date *</label>
                <input type="date" value={form.joined_date}
                  onChange={e => set('joined_date', e.target.value)} required className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Notes</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className={INPUT} />
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={saving}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                  {saving ? 'Creating…' : 'Open Account'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Shares Held',   value: data.shares },
          { label: 'Per Share',     value: K(data.amount_per_share) },
          { label: 'Share Value',   value: K(data.share_value), highlight: true },
          { label: 'Total Paid In', value: K(data.total_paid) },
        ].map(c => (
          <div key={c.label} className={`bg-white rounded-xl border p-4 ${c.highlight ? 'border-blue-200' : 'border-gray-200'}`}>
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-xl font-bold ${c.highlight ? 'text-blue-600' : 'text-gray-800'}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Action */}
      <div className="flex justify-end gap-2">
        <button onClick={() => open('setup')}
          className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
          Update Share Price
        </button>
        <button onClick={() => open('purchase')}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
          <Plus size={15} /> Buy Shares
        </button>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800">Share Transactions</h3>
        </div>
        {!data.transactions?.length ? (
          <p className="text-sm text-gray-400 text-center py-8">No transactions yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-2 text-xs text-gray-500">Date</th>
                <th className="text-left px-4 py-2 text-xs text-gray-500">Type</th>
                <th className="text-right px-4 py-2 text-xs text-gray-500">Shares</th>
                <th className="text-right px-4 py-2 text-xs text-gray-500">Amount</th>
                <th className="text-left px-4 py-2 text-xs text-gray-500">Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.transactions.map(tx => (
                <tr key={tx.id}>
                  <td className="px-4 py-2.5 text-gray-600">{tx.transaction_date}</td>
                  <td className={`px-4 py-2.5 capitalize font-medium ${TX_COLORS[tx.type]}`}>{tx.type}</td>
                  <td className="px-4 py-2.5 text-right text-gray-700">{tx.shares ?? '—'}</td>
                  <td className={`px-4 py-2.5 text-right font-semibold ${TX_COLORS[tx.type]}`}>{K(tx.amount)}</td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">{tx.reference || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Purchase modal */}
      {modal === 'purchase' && (
        <Modal title="Buy Shares" onClose={() => setModal(null)}>
          <form onSubmit={handlePurchase} className="space-y-3">
            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                {serverError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Number of Shares *</label>
                <input type="number" step="0.01" value={form.shares}
                  onChange={e => set('shares', e.target.value)} required className={INPUT} />
                {errors.shares && <p className="text-xs text-red-600 mt-1">{errors.shares[0]}</p>}
              </div>
              <div>
                <label className={LABEL}>Amount Paid (K) *</label>
                <input type="number" step="0.01" value={form.amount}
                  onChange={e => set('amount', e.target.value)} required className={INPUT} />
                {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount[0]}</p>}
              </div>
            </div>
            <div>
              <label className={LABEL}>Date *</label>
              <input type="date" value={form.transaction_date}
                onChange={e => set('transaction_date', e.target.value)} required className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Reference</label>
              <input type="text" value={form.reference}
                onChange={e => set('reference', e.target.value)}
                placeholder="Receipt no., mobile money ref…"
                className={INPUT} />
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700">
              Share price: {K(data.amount_per_share)} per share
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving}
                className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60">
                {saving ? 'Saving…' : 'Record Purchase'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Update share price modal */}
      {modal === 'setup' && (
        <Modal title="Update Share Account" onClose={() => setModal(null)}>
          <form onSubmit={handleSetup} className="space-y-3">
            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                {serverError}
              </div>
            )}
            <div>
              <label className={LABEL}>Share Price (K per share) *</label>
              <input type="number" step="0.01" value={form.amount_per_share}
                onChange={e => set('amount_per_share', e.target.value)} required className={INPUT} />
              {errors.amount_per_share && <p className="text-xs text-red-600 mt-1">{errors.amount_per_share[0]}</p>}
            </div>
            <div>
              <label className={LABEL}>Join Date *</label>
              <input type="date" value={form.joined_date}
                onChange={e => set('joined_date', e.target.value)} required className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Notes</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className={INPUT} />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Saving…' : 'Update'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
