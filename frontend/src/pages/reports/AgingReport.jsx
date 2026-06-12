import { useEffect, useState } from 'react'
import api from '../../api/axios'

const BUCKET_COLORS = {
  '1-30':  'bg-yellow-50 border-yellow-200 text-yellow-700',
  '31-60': 'bg-orange-50 border-orange-200 text-orange-700',
  '61-90': 'bg-red-50 border-red-200 text-red-600',
  '90+':   'bg-red-100 border-red-300 text-red-800',
}

export default function AgingReport() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState('1-30')

  useEffect(() => {
    api.get('/reports/aging').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-400 text-sm">Loading…</p>
  if (!data) return null

  return (
    <div>
      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 text-sm">
        <span className="text-red-700">Total PAR: </span>
        <strong className="text-red-800">K{Number(data.total_par).toLocaleString()}</strong>
        <span className="text-red-600 ml-2">({data.total_loans_in_arrears} loans in arrears)</span>
      </div>

      {/* Bucket summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Object.entries(data.buckets).map(([key, bucket]) => (
          <button key={key} onClick={() => setOpen(key)}
            className={`rounded-xl border p-4 text-left transition-all ${BUCKET_COLORS[key]} ${open === key ? 'ring-2 ring-offset-1 ring-current' : ''}`}>
            <p className="text-xs font-medium mb-1">{bucket.label}</p>
            <p className="text-xl font-bold">{bucket.loans.length} loans</p>
            <p className="text-xs mt-1">K{Number(bucket.total).toLocaleString()}</p>
          </button>
        ))}
      </div>

      {/* Loans in selected bucket */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800">
            {data.buckets[open]?.label} — {data.buckets[open]?.loans.length} loans
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Loan No.</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Borrower</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Outstanding</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Days Arrears</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Officer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.buckets[open]?.loans.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No loans in this bucket.</td></tr>
            ) : data.buckets[open]?.loans.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-gray-700">{row.loan_no}</td>
                <td className="px-4 py-3 font-medium">{row.borrower}</td>
                <td className="px-4 py-3 text-gray-600">{row.phone}</td>
                <td className="px-4 py-3 text-gray-600">{row.product}</td>
                <td className="px-4 py-3 text-right font-medium text-red-600">K{Number(row.outstanding).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-red-600 font-medium">{row.days_in_arrears}</td>
                <td className="px-4 py-3 text-gray-600">{row.officer || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
