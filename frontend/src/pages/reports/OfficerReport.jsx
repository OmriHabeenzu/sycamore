import { useState } from 'react'
import api from '../../api/axios'

const firstOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
const today = new Date().toISOString().split('T')[0]

export default function OfficerReport() {
  const [from, setFrom] = useState(firstOfYear)
  const [to, setTo]     = useState(today)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    try {
      const { data: res } = await api.get('/reports/officer-performance', {
        params: { date_from: from, date_to: to },
      })
      setData(res.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 items-end mb-6">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Disbursed From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={run} disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
          {loading ? 'Loading…' : 'Run Report'}
        </button>
      </div>

      {data && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Officer</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Loans</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Disbursed</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Collected</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Outstanding</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">PAR</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Collection Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No data.</td></tr>
              ) : data.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{row.officer}</td>
                  <td className="px-4 py-3 text-right">{row.loan_count}</td>
                  <td className="px-4 py-3 text-right">K{Number(row.total_disbursed).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-green-700">K{Number(row.total_collected).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">K{Number(row.total_outstanding).toLocaleString()}</td>
                  <td className={`px-4 py-3 text-right ${row.par_count > 0 ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                    {row.par_count > 0 ? `K${Number(row.par_amount).toLocaleString()} (${row.par_count})` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${row.collection_rate >= 80 ? 'text-green-600' : row.collection_rate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {row.collection_rate}%
                    </span>
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
