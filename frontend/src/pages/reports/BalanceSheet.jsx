import { useState } from 'react'
import api from '../../api/axios'

const K = v => `K${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function Section({ title, rows, total, color = 'gray' }) {
  const colors = {
    blue:  { header: 'bg-blue-50 text-blue-700',  total: 'text-blue-700' },
    red:   { header: 'bg-red-50 text-red-700',    total: 'text-red-700' },
    green: { header: 'bg-green-50 text-green-700',total: 'text-green-700' },
    gray:  { header: 'bg-gray-50 text-gray-700',  total: 'text-gray-700' },
  }
  const c = colors[color]
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className={`px-5 py-3 ${c.header}`}>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-gray-100">
          {rows.map(([label, val]) => (
            <tr key={label}>
              <td className="px-5 py-3 text-gray-600">{label}</td>
              <td className="px-5 py-3 text-right font-medium text-gray-800">{K(val)}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-gray-200">
            <td className={`px-5 py-3 font-semibold ${c.total}`}>Total {title}</td>
            <td className={`px-5 py-3 text-right font-bold ${c.total}`}>{K(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default function BalanceSheet() {
  const [asAt, setAsAt]   = useState(new Date().toISOString().slice(0, 10))
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function run() {
    setLoading(true); setError(null)
    try {
      const { data: res } = await api.get('/reports/balance-sheet', { params: { as_at: asAt } })
      setData(res)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load report.')
    } finally { setLoading(false) }
  }

  const balanced = data && Math.abs(data.assets.total - data.total_liabilities_and_equity) < 1

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">As At</label>
            <input type="date" value={asAt} onChange={e => setAsAt(e.target.value)}
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
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-800">Balance Sheet</h2>
            <p className="text-sm text-gray-500">As at {data.as_at}</p>
          </div>

          {/* Balance check badge */}
          <div className={`text-center text-xs font-medium px-3 py-1 rounded-full inline-flex mx-auto ${
            balanced ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {balanced ? 'Balanced' : 'Note: Assets ≠ Liabilities + Equity (rounding or missing data)'}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column: Assets */}
            <Section
              title="Assets"
              color="blue"
              rows={[
                ['Loan Portfolio (Outstanding)', data.assets.loan_portfolio],
                ['Cash & Bank', data.assets.cash_and_bank],
              ]}
              total={data.assets.total}
            />

            {/* Right column: Liabilities + Equity */}
            <div className="space-y-6">
              <Section
                title="Liabilities"
                color="red"
                rows={[
                  ['Member Savings Balances', data.liabilities.member_savings],
                ]}
                total={data.liabilities.total}
              />

              <Section
                title="Equity"
                color="green"
                rows={[
                  ['Share Capital', data.equity.share_capital],
                  ['Contributions Pool', data.equity.contributions_pool],
                  ['Retained Surplus', data.equity.retained_surplus],
                ]}
                total={data.equity.total}
              />
            </div>
          </div>

          {/* Totals check */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Assets</p>
              <p className="text-xl font-bold text-blue-700">{K(data.assets.total)}</p>
            </div>
            <div className="text-gray-400 font-bold text-xl">=</div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Liabilities + Equity</p>
              <p className="text-xl font-bold text-green-700">{K(data.total_liabilities_and_equity)}</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
