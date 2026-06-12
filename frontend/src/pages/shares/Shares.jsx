import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Landmark } from 'lucide-react'
import api from '../../api/axios'

const K = v => `K${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function Shares() {
  const navigate = useNavigate()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/shares/summary').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const members = data?.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Share Capital</h1>
        <p className="text-sm text-slate-500 mt-0.5">Member shareholdings and capital contributions</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Shareholders', value: data?.total_members ?? 0, icon: '👥' },
          { label: 'Total Shares', value: Number(data?.total_shares ?? 0).toLocaleString(), icon: '📋' },
          { label: 'Total Share Capital', value: K(data?.total_share_capital), icon: '💰', highlight: true },
        ].map(c => (
          <div key={c.label} className={`bg-white rounded-2xl border p-5 ${c.highlight ? 'border-emerald-200' : 'border-slate-200'}`}>
            <p className="text-2xl mb-1">{c.icon}</p>
            <p className={`text-2xl font-bold ${c.highlight ? 'text-emerald-700' : 'text-slate-800'}`}>{c.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-700">All Shareholders</h2>
        </div>
        {members.length === 0 ? (
          <div className="text-center py-14">
            <Landmark size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No share accounts yet.</p>
            <p className="text-slate-400 text-xs mt-1">Open share accounts from each member's profile.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Member</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Member No.</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Shares</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Per Share</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Share Value</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Total Paid</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Joined</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/borrowers/${m.borrower_id}`)}>
                  <td className="px-6 py-3.5 font-medium text-slate-800">{m.member}</td>
                  <td className="px-6 py-3.5 font-mono text-xs text-slate-500">{m.member_no}</td>
                  <td className="px-6 py-3.5 text-right text-slate-700">{Number(m.shares).toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-right text-slate-500">{K(m.amount_per_share)}</td>
                  <td className="px-6 py-3.5 text-right font-semibold text-emerald-700">{K(m.share_value)}</td>
                  <td className="px-6 py-3.5 text-right text-slate-600">{K(m.total_paid)}</td>
                  <td className="px-6 py-3.5 text-slate-500">{m.joined_date}</td>
                  <td className="px-6 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                      m.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>{m.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50">
              <tr>
                <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-slate-700">Totals</td>
                <td className="px-6 py-3 text-right font-bold text-emerald-700">{K(data?.total_share_capital)}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
