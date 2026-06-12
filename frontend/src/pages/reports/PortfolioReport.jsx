import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function PortfolioReport() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reports/portfolio').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-400 text-sm">Loading…</p>
  if (!data) return null

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Disbursed',   value: `K${Number(data.total_disbursed).toLocaleString()}` },
          { label: 'Total Outstanding', value: `K${Number(data.total_outstanding).toLocaleString()}` },
          { label: 'Portfolio at Risk', value: `K${Number(data.par_amount).toLocaleString()}`, red: data.par_amount > 0 },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl border p-4 ${s.red ? 'border-red-200' : 'border-gray-200'}`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.red ? 'text-red-600' : 'text-gray-800'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Loan No.</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Borrower</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Principal</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Paid</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Outstanding</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Maturity</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Days Arrears</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.data.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">No active loans.</td></tr>
              ) : data.data.map((row, i) => (
                <tr key={i} className={row.is_overdue ? 'bg-red-50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-3 font-mono text-gray-700">{row.loan_no}</td>
                  <td className="px-4 py-3 font-medium">{row.borrower}</td>
                  <td className="px-4 py-3 text-gray-600">{row.product}</td>
                  <td className="px-4 py-3 text-right">K{Number(row.principal).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-green-700">K{Number(row.total_paid).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-medium">K{Number(row.outstanding).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{row.maturity_date}</td>
                  <td className={`px-4 py-3 text-right font-medium ${row.days_in_arrears > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {row.days_in_arrears || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.officer || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
