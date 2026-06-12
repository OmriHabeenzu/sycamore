import { useEffect, useState } from 'react'
import { Plus, Heart, Coins, CheckCircle, XCircle, Clock, Loader, X, Banknote } from 'lucide-react'
import api from '../../api/axios'

const CLAIM_TYPES = ['bereavement', 'medical', 'emergency', 'other']
const CLAIM_STATUS_COLOR = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  paid:     'bg-green-100 text-green-700',
}

const CONTRIB_INIT = { borrower_id: '', amount: '', period: new Date().toISOString().slice(0,7), payment_method: 'cash', reference: '', contribution_date: new Date().toISOString().slice(0,10) }
const CLAIM_INIT   = { borrower_id: '', claim_type: 'bereavement', beneficiary_name: '', relationship: '', amount_requested: '', reason: '' }

export default function Welfare() {
  const [tab, setTab]             = useState('overview')
  const [summary, setSummary]     = useState(null)
  const [contribs, setContribs]   = useState([])
  const [claims, setClaims]       = useState([])
  const [members, setMembers]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(null)
  const [contribForm, setContribForm] = useState(CONTRIB_INIT)
  const [claimForm, setClaimForm] = useState(CLAIM_INIT)
  const [reviewForm, setReviewForm] = useState({ status: 'approved', amount_approved: '', review_notes: '' })
  const [selected, setSelected]   = useState(null)
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    fetchAll()
    api.get('/borrowers?per_page=200').then(r => setMembers(r.data.data || []))
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [s, c, cl] = await Promise.all([
        api.get('/welfare/summary'),
        api.get('/welfare/contributions'),
        api.get('/welfare/claims'),
      ])
      setSummary(s.data)
      setContribs(c.data.data?.data || [])
      setClaims(cl.data.data?.data || [])
    } finally {
      setLoading(false)
    }
  }

  const saveContrib = async () => {
    setSaving(true)
    try {
      await api.post('/welfare/contributions', contribForm)
      setModal(null)
      setContribForm(CONTRIB_INIT)
      fetchAll()
    } finally { setSaving(false) }
  }

  const saveClaim = async () => {
    setSaving(true)
    try {
      await api.post('/welfare/claims', claimForm)
      setModal(null)
      setClaimForm(CLAIM_INIT)
      fetchAll()
    } finally { setSaving(false) }
  }

  const reviewClaim = async () => {
    setSaving(true)
    try {
      await api.post(`/welfare/claims/${selected.id}/review`, reviewForm)
      setModal(null)
      fetchAll()
    } finally { setSaving(false) }
  }

  const markPaid = async (id) => {
    await api.post(`/welfare/claims/${id}/mark-paid`)
    fetchAll()
  }

  const fmt     = n => `K${Number(n || 0).toLocaleString()}`
  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">Welfare Fund</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModal('contrib')} className="flex items-center gap-2 bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-800">
            <Coins className="w-4 h-4" /> Record Contribution
          </button>
          <button onClick={() => setModal('claim')} className="flex items-center gap-2 bg-rose-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-rose-700">
            <Plus className="w-4 h-4" /> New Claim
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Collected',  value: fmt(summary.total_contributions), color: 'text-green-700' },
            { label: 'Total Disbursed',  value: fmt(summary.total_disbursed),     color: 'text-red-600' },
            { label: 'Fund Balance',     value: fmt(summary.balance),             color: 'text-blue-700' },
            { label: 'Pending Claims',   value: summary.pending_claims,           color: 'text-amber-600' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {['contributions', 'claims'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader className="w-6 h-6 animate-spin text-green-600" /></div> : (

        tab === 'contributions' ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Member</th>
                  <th className="px-4 py-3 text-left">Period</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {contribs.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-gray-400">No contributions recorded yet.</td></tr>}
                {contribs.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.borrower?.first_name} {c.borrower?.last_name}</td>
                    <td className="px-4 py-3 text-gray-500">{c.period}</td>
                    <td className="px-4 py-3 text-gray-500">{fmtDate(c.contribution_date)}</td>
                    <td className="px-4 py-3 capitalize text-gray-500">{c.payment_method || '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700">{fmt(c.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Ref</th>
                  <th className="px-4 py-3 text-left">Member</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Beneficiary</th>
                  <th className="px-4 py-3 text-right">Requested</th>
                  <th className="px-4 py-3 text-right">Approved</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {claims.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-gray-400">No claims yet.</td></tr>}
                {claims.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.claim_ref}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{c.borrower?.first_name} {c.borrower?.last_name}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{c.claim_type}</td>
                    <td className="px-4 py-3 text-gray-500">{c.beneficiary_name}</td>
                    <td className="px-4 py-3 text-right">{fmt(c.amount_requested)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700">{c.amount_approved ? fmt(c.amount_approved) : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${CLAIM_STATUS_COLOR[c.status] || ''}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {c.status === 'pending' && (
                          <button onClick={() => { setSelected(c); setReviewForm({ status: 'approved', amount_approved: c.amount_requested, review_notes: '' }); setModal('review') }}
                            className="text-xs text-green-700 font-medium hover:underline">Review</button>
                        )}
                        {c.status === 'approved' && (
                          <button onClick={() => markPaid(c.id)} className="text-xs text-blue-700 font-medium hover:underline">Mark Paid</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Record contribution modal */}
      {modal === 'contrib' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Record Welfare Contribution</h2>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Member *</label>
                <select value={contribForm.borrower_id} onChange={e => setContribForm(p => ({ ...p, borrower_id: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="">Select member...</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name} — {m.phone}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Period (YYYY-MM) *</label>
                  <input type="month" value={contribForm.period} onChange={e => setContribForm(p => ({ ...p, period: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Amount (K) *</label>
                  <input type="number" value={contribForm.amount} onChange={e => setContribForm(p => ({ ...p, amount: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
                  <input type="date" value={contribForm.contribution_date} onChange={e => setContribForm(p => ({ ...p, contribution_date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Method</label>
                  <select value={contribForm.payment_method} onChange={e => setContribForm(p => ({ ...p, payment_method: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                    {['cash','mobile_money','bank_transfer'].map(m => <option key={m} value={m}>{m.replace('_',' ')}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button onClick={saveContrib} disabled={saving || !contribForm.borrower_id || !contribForm.amount}
                className="flex items-center gap-2 bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50">
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New claim modal */}
      {modal === 'claim' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">New Welfare Claim</h2>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Member *</label>
                <select value={claimForm.borrower_id} onChange={e => setClaimForm(p => ({ ...p, borrower_id: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="">Select member...</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Claim Type *</label>
                  <select value={claimForm.claim_type} onChange={e => setClaimForm(p => ({ ...p, claim_type: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                    {CLAIM_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Amount Requested (K) *</label>
                  <input type="number" value={claimForm.amount_requested} onChange={e => setClaimForm(p => ({ ...p, amount_requested: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Beneficiary Name *</label>
                  <input value={claimForm.beneficiary_name} onChange={e => setClaimForm(p => ({ ...p, beneficiary_name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" placeholder="Who is this for?" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Relationship</label>
                  <input value={claimForm.relationship} onChange={e => setClaimForm(p => ({ ...p, relationship: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g. Spouse" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Reason / Description *</label>
                <textarea value={claimForm.reason} onChange={e => setClaimForm(p => ({ ...p, reason: e.target.value }))} rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none" />
              </div>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button onClick={saveClaim} disabled={saving || !claimForm.borrower_id || !claimForm.amount_requested || !claimForm.beneficiary_name || !claimForm.reason}
                className="flex items-center gap-2 bg-rose-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-50">
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : 'Submit Claim'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review claim modal */}
      {modal === 'review' && selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Review Claim — {selected.claim_ref}</h2>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-3">
              <div className="bg-gray-50 rounded-xl p-4 text-sm">
                <p><span className="text-gray-500">Member:</span> <strong>{selected.borrower?.first_name} {selected.borrower?.last_name}</strong></p>
                <p className="mt-1"><span className="text-gray-500">Type:</span> <span className="capitalize">{selected.claim_type}</span></p>
                <p className="mt-1"><span className="text-gray-500">Requested:</span> <strong>{fmt(selected.amount_requested)}</strong></p>
                <p className="mt-1 text-gray-600 text-xs">{selected.reason}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Decision *</label>
                <select value={reviewForm.status} onChange={e => setReviewForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>
              {reviewForm.status === 'approved' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Amount to Approve (K)</label>
                  <input type="number" value={reviewForm.amount_approved} onChange={e => setReviewForm(p => ({ ...p, amount_approved: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea value={reviewForm.review_notes} onChange={e => setReviewForm(p => ({ ...p, review_notes: e.target.value }))} rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none" />
              </div>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button onClick={reviewClaim} disabled={saving}
                className="flex items-center gap-2 bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50">
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : 'Save Decision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
