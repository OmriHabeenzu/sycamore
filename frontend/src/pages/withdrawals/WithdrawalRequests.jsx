import { useEffect, useState } from 'react'
import { Loader, CheckCircle, XCircle, Clock, Filter } from 'lucide-react'
import api from '../../api/axios'

const STATUS = {
  pending:  { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  rejected: { color: 'bg-red-100 text-red-700',      icon: XCircle },
}

export default function WithdrawalRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('pending')
  const [selected, setSelected] = useState(null)
  const [notes, setNotes]       = useState('')
  const [acting, setActing]     = useState(false)

  useEffect(() => { fetchRequests() }, [filter])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await api.get('/withdrawal-requests', { params: { status: filter || undefined } })
      setRequests(res.data.data?.data || [])
    } finally {
      setLoading(false)
    }
  }

  const act = async (id, action) => {
    setActing(true)
    try {
      await api.post(`/withdrawal-requests/${id}/${action}`, { review_notes: notes })
      setSelected(null)
      setNotes('')
      fetchRequests()
    } finally {
      setActing(false)
    }
  }

  const fmt     = n => `K${Number(n || 0).toLocaleString()}`
  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Withdrawal Requests</h1>
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', ''].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader className="w-6 h-6 animate-spin text-green-600" /></div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No {filter} requests.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Member</th>
                <th className="px-4 py-3 text-left">Account</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Reason</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map(r => {
                const S = STATUS[r.status] || STATUS.pending
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {r.borrower?.first_name} {r.borrower?.last_name}
                      <div className="text-xs text-gray-400">{r.borrower?.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{r.savings_account?.account_no}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(r.amount)}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{r.reason || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{fmtDate(r.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${S.color}`}>
                        <S.icon className="w-3 h-3" /> {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.status === 'pending' && (
                        <button onClick={() => { setSelected(r); setNotes('') }}
                          className="text-xs text-green-700 font-medium hover:underline">
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Review modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Review Withdrawal Request</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Member</span>
                  <span className="font-medium">{selected.borrower?.first_name} {selected.borrower?.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Account</span>
                  <span className="font-mono text-xs">{selected.savings_account?.account_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount Requested</span>
                  <span className="font-bold text-gray-900">{fmt(selected.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Account Balance</span>
                  <span className="font-medium text-green-700">{fmt(selected.savings_account?.balance)}</span>
                </div>
                {selected.reason && (
                  <div><span className="text-gray-500">Reason:</span> <span className="text-gray-700">{selected.reason}</span></div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
                  placeholder="Add a note for this decision..." />
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => act(selected.id, 'reject')} disabled={acting}
                className="flex-1 py-2 text-sm font-medium bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50">
                Reject
              </button>
              <button onClick={() => act(selected.id, 'approve')} disabled={acting}
                className="flex-1 py-2 text-sm font-medium bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50">
                {acting ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
