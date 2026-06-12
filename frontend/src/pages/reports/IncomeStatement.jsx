import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../../api/axios'

const K = v => `K${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function thisMonthRange() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return {
    date_from: `${y}-${m}-01`,
    date_to: now.toISOString().slice(0, 10),
  }
}

export default function IncomeStatement() {
  const [filters, setFilters] = useState(thisMonthRange)
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function run() {
    setLoading(true); setError(null)
    try {
      const { data: res } = await api.get('/reports/income-statement', { params: filters })
      setData(res)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load report.')
    } finally { setLoading(false) }
  }

  function set(f, v) { setFilters(p => ({ ...p, [f]: v })) }

  const netPositive = data && data.net_income >= 0

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
            <input type="date" value={filters.date_from} onChange={e => set('date_from', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
            <input type="date" value={filters.date_to} onChange={e => set('date_to', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={run} disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
            {loading ? 'Loading…' : 'Generate'}
          </button>
          {data && (
            <button onClick={() => window.print()}
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
              Print
            </button>
          )}
        </div>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </div>

      {data && (
        <>
          {/* Period header */}
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-800">Income Statement</h2>
            <p className="text-sm text-gray-500">{data.period.from} — {data.period.to}</p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <p className="text-xs font-medium text-green-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-700">{K(data.revenue.total)}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <p className="text-xs font-medium text-red-600 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-red-700">{K(data.expenses.total)}</p>
            </div>
            <div className={`rounded-xl p-5 border ${netPositive ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
              <p className={`text-xs font-medium mb-1 ${netPositive ? 'text-blue-600' : 'text-orange-600'}`}>Net Income</p>
              <p className={`text-2xl font-bold ${netPositive ? 'text-blue-700' : 'text-orange-700'}`}>{K(data.net_income)}</p>
            </div>
          </div>

          {/* Revenue breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">Revenue</h3>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {[
                  ['Interest Collected',   data.revenue.interest_collected],
                  ['Fees Collected',       data.revenue.fees_collected],
                  ['Penalties Collected',  data.revenue.penalties_collected],
                ].map(([label, val]) => (
                  <tr key={label}>
                    <td className="px-5 py-3 text-gray-600">{label}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-800">{K(val)}</td>
                  </tr>
                ))}
                <tr className="bg-green-50">
                  <td className="px-5 py-3 font-semibold text-green-700">Total Revenue</td>
                  <td className="px-5 py-3 text-right font-bold text-green-700">{K(data.revenue.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Expenses breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">Expenses by Category</h3>
            </div>
            {data.expenses.by_category.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No expenses recorded in this period.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  {data.expenses.by_category.map(row => (
                    <tr key={row.category}>
                      <td className="px-5 py-3 text-gray-600 capitalize">{row.category}</td>
                      <td className="px-5 py-3 text-right font-medium text-gray-800">{K(row.total)}</td>
                    </tr>
                  ))}
                  <tr className="bg-red-50">
                    <td className="px-5 py-3 font-semibold text-red-700">Total Expenses</td>
                    <td className="px-5 py-3 text-right font-bold text-red-700">{K(data.expenses.total)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          {/* Net income summary */}
          <div className={`rounded-xl border p-5 flex justify-between items-center ${netPositive ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
            <span className={`font-semibold text-base ${netPositive ? 'text-blue-700' : 'text-orange-700'}`}>
              Net Income / (Loss)
            </span>
            <span className={`text-2xl font-bold ${netPositive ? 'text-blue-700' : 'text-orange-700'}`}>
              {data.net_income < 0 ? `(${K(Math.abs(data.net_income))})` : K(data.net_income)}
            </span>
          </div>

          {/* Monthly breakdown chart */}
          {data.monthly_breakdown.length > 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Breakdown</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.monthly_breakdown} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `K${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(val, name) => [K(val), name]} />
                  <Legend />
                  <Bar dataKey="total_revenue"  name="Revenue"  fill="#22c55e" radius={[3,3,0,0]} />
                  <Bar dataKey="total_expenses" name="Expenses" fill="#ef4444" radius={[3,3,0,0]} />
                  <Bar dataKey="net_income"     name="Net"      fill="#3b82f6" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>

              {/* Monthly table */}
              <table className="w-full text-sm mt-4">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-2 px-1 text-xs text-gray-500">Month</th>
                    <th className="text-right py-2 px-1 text-xs text-gray-500">Revenue</th>
                    <th className="text-right py-2 px-1 text-xs text-gray-500">Expenses</th>
                    <th className="text-right py-2 px-1 text-xs text-gray-500">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.monthly_breakdown.map(row => (
                    <tr key={row.month}>
                      <td className="py-2 px-1 text-gray-600">{row.month}</td>
                      <td className="py-2 px-1 text-right text-green-700">{K(row.total_revenue)}</td>
                      <td className="py-2 px-1 text-right text-red-600">{K(row.total_expenses)}</td>
                      <td className={`py-2 px-1 text-right font-semibold ${row.net_income >= 0 ? 'text-blue-700' : 'text-orange-600'}`}>
                        {row.net_income < 0 ? `(${K(Math.abs(row.net_income))})` : K(row.net_income)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
