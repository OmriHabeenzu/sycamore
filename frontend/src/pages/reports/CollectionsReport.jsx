import { useState } from 'react'
import { Download } from 'lucide-react'
import api from '../../api/axios'

const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
const today = new Date().toISOString().split('T')[0]

export default function CollectionsReport() {
  const [from, setFrom] = useState(firstOfMonth)
  const [to, setTo]     = useState(today)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    try {
      const { data: res } = await api.get('/reports/collections', {
        params: { date_from: from, date_to: to },
      })
      setData(res)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end mb-6">
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
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
        <>
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4 text-sm">
            <span className="text-green-700">Total collected: </span>
            <strong className="text-green-800">K{Number(data.total).toLocaleString()}</strong>
            <span className="text-green-600 ml-2">({data.data.length} payments)</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Loan No.</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Borrower</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Principal</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Interest</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Method</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Ref</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Received by</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.data.length === 0 ? (
                    <tr><td colSpan={10} className="text-center py-8 text-gray-400">No collections in this period.</td></tr>
                  ) : data.data.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{row.payment_date}</td>
                      <td className="px-4 py-3 font-mono text-gray-700">{row.loan_no}</td>
                      <td className="px-4 py-3 font-medium">{row.borrower}</td>
                      <td className="px-4 py-3 text-gray-600">{row.phone}</td>
                      <td className="px-4 py-3 text-right font-medium text-green-700">K{Number(row.amount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-gray-600">K{Number(row.principal).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-gray-600">K{Number(row.interest).toLocaleString()}</td>
                      <td className="px-4 py-3 capitalize text-gray-600">{row.payment_method?.replace('_',' ')}</td>
                      <td className="px-4 py-3 text-gray-400">{row.reference || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{row.received_by || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
