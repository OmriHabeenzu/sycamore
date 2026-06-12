import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Printer } from 'lucide-react'
import api from '../../api/axios'

const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
const today = new Date().toISOString().split('T')[0]

export default function Repayments() {
  const navigate = useNavigate()
  const [repayments, setRepayments] = useState([])
  const [meta, setMeta] = useState({})
  const [from, setFrom] = useState(firstOfMonth)
  const [to, setTo]     = useState(today)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/repayments', {
        params: { date_from: from, date_to: to, page },
      })
      setRepayments(data.data)
      setMeta(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [from, to, page])

  const total = repayments.reduce((s, r) => s + Number(r.amount), 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Repayments</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1) }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(1) }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {!loading && repayments.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 mb-4 text-sm text-green-700">
          Page total: <strong>K{total.toLocaleString()}</strong>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Receipt</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Loan No.</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Borrower</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Principal</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Interest</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Method</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Ref</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={10} className="text-center py-10 text-gray-400">Loading…</td></tr>
            ) : repayments.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-10 text-gray-400">No repayments found.</td></tr>
            ) : repayments.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/loans/${r.loan_id}`)}>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.receipt_no || '—'}</td>
                <td className="px-4 py-3">{r.payment_date}</td>
                <td className="px-4 py-3 font-mono text-gray-700">{r.loan?.loan_no}</td>
                <td className="px-4 py-3 font-medium">
                  {r.loan?.borrower?.first_name} {r.loan?.borrower?.last_name}
                </td>
                <td className="px-4 py-3 text-right font-medium text-green-700">K{Number(r.amount).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-gray-600">K{Number(r.principal_amount).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-gray-600">K{Number(r.interest_amount).toLocaleString()}</td>
                <td className="px-4 py-3 capitalize text-gray-600">{r.payment_method?.replace('_',' ')}</td>
                <td className="px-4 py-3 text-gray-400">{r.reference_number || '—'}</td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <a href={`/repayments/${r.id}/receipt`} target="_blank" rel="noreferrer"
                    className="text-gray-400 hover:text-blue-600" title="Print receipt">
                    <Printer size={14} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
            <span>Page {meta.current_page} of {meta.last_page}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50">Prev</button>
              <button disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
