import { useEffect, useState } from 'react'
import { Loader, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react'
import api from '../../api/axios'
import { useNavigate } from 'react-router-dom'

export default function SavingsCompliance() {
  const [members, setMembers]   = useState([])
  const [contribs, setContribs] = useState([])
  const [loading, setLoading]   = useState(true)
  const [period, setPeriod]     = useState(new Date().toISOString().slice(0, 7))
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/borrowers?per_page=200&status=active'),
      api.get('/contributions?per_page=500'),
    ]).then(([m, c]) => {
      setMembers(m.data.data || [])
      setContribs(c.data.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const fmt = n => `K${Number(n || 0).toLocaleString()}`

  // Build compliance list: for each active member with a commitment, check if they contributed this period
  const rows = members
    .filter(m => m.monthly_savings_commitment > 0)
    .map(m => {
      const contributed = contribs
        .filter(c => c.borrower_id === m.id)
        .filter(c => c.contribution_date?.slice(0, 7) === period)
        .reduce((s, c) => s + Number(c.amount), 0)

      const commitment = Number(m.monthly_savings_commitment)
      const shortfall  = Math.max(0, commitment - contributed)
      const pct        = commitment > 0 ? Math.min(100, Math.round((contributed / commitment) * 100)) : 100

      return { ...m, contributed, commitment, shortfall, pct }
    })
    .sort((a, b) => a.pct - b.pct)   // worst first

  const behind  = rows.filter(r => r.pct < 100).length
  const onTrack = rows.filter(r => r.pct >= 100).length

  if (loading) return <div className="flex justify-center py-20"><Loader className="w-7 h-7 animate-spin text-green-600" /></div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Savings Compliance</h1>
          <p className="text-sm text-gray-400 mt-0.5">Members vs their monthly savings commitment</p>
        </div>
        <input type="month" value={period} onChange={e => setPeriod(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{rows.length}</div>
          <div className="text-xs text-gray-500">Members with commitment</div>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 p-4">
          <div className="text-2xl font-bold text-green-700">{onTrack}</div>
          <div className="text-xs text-green-600">On track / fully paid</div>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-100 p-4">
          <div className="text-2xl font-bold text-red-600">{behind}</div>
          <div className="text-xs text-red-500">Behind on commitment</div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No active members with savings commitments.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Member</th>
                <th className="px-4 py-3 text-right">Commitment</th>
                <th className="px-4 py-3 text-right">Contributed</th>
                <th className="px-4 py-3 text-right">Shortfall</th>
                <th className="px-4 py-3 text-left w-40">Progress</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/borrowers/${r.id}`)}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{r.first_name} {r.last_name}</div>
                    <div className="text-xs text-gray-400">{r.borrower_no}</div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{fmt(r.commitment)}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{fmt(r.contributed)}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${r.shortfall > 0 ? 'text-red-600' : 'text-gray-300'}`}>
                    {r.shortfall > 0 ? fmt(r.shortfall) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${r.pct >= 100 ? 'bg-green-500' : r.pct >= 50 ? 'bg-amber-400' : 'bg-red-500'}`}
                          style={{ width: `${r.pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{r.pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {r.pct >= 100
                      ? <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle className="w-3.5 h-3.5" /> On track</span>
                      : r.pct === 0
                        ? <span className="flex items-center gap-1 text-xs text-red-600 font-medium"><AlertTriangle className="w-3.5 h-3.5" /> No payment</span>
                        : <span className="flex items-center gap-1 text-xs text-amber-600 font-medium"><TrendingDown className="w-3.5 h-3.5" /> Partial</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
