import { useEffect, useState } from 'react'
import { Loader } from 'lucide-react'
import api from '../../api/axios'

export default function MemberContributions() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/my/contributions')
      .then(r => setItems(r.data.data || []))
      .finally(() => setLoading(false))
  }, [])

  const fmt    = n => `K${Number(n || 0).toLocaleString()}`
  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
  const total   = items.reduce((s, i) => s + Number(i.amount || 0), 0)

  if (loading) return <div className="flex justify-center py-20"><Loader className="w-7 h-7 animate-spin text-emerald-500" /></div>

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Contributions</h1>
        <div className="text-right">
          <div className="text-xs text-gray-400">Total contributed</div>
          <div className="text-xl font-bold text-emerald-700">{fmt(total)}</div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No contributions recorded yet.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Period</th>
                <th className="px-4 py-3 text-left">Method</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{fmtDate(c.contribution_date)}</td>
                  <td className="px-4 py-3 text-gray-500">{c.period || '—'}</td>
                  <td className="px-4 py-3 capitalize text-gray-500">{c.payment_method || '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-700">{fmt(c.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
