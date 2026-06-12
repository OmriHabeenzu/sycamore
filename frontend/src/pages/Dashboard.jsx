import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, FileText, PiggyBank, Coins, TrendingUp,
  AlertTriangle, ArrowRight, CreditCard, Landmark,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import api from '../api/axios'

const K = n => 'K' + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const STATUS_COLORS = {
  pending:    'bg-amber-100 text-amber-700',
  approved:   'bg-blue-100 text-blue-700',
  active:     'bg-emerald-100 text-emerald-700',
  closed:     'bg-slate-100 text-slate-500',
  defaulted:  'bg-red-100 text-red-700',
  rejected:   'bg-red-50 text-red-400',
  written_off:'bg-slate-100 text-slate-400',
}

function StatCard({ icon: Icon, label, value, sub, iconBg = 'bg-emerald-100', iconColor = 'text-emerald-600', danger, highlight }) {
  return (
    <div className={`bg-white rounded-2xl border p-5 transition-shadow hover:shadow-md ${
      danger ? 'border-red-200' : highlight ? 'border-emerald-200' : 'border-slate-200'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={18} className={iconColor} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${danger ? 'text-red-600' : 'text-slate-800'}`}>{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!data) return null

  const { stats, recent_loans, monthly_contributions, monthly_repayments } = data

  const months = [...new Set([
    ...monthly_contributions.map(m => m.month),
    ...monthly_repayments.map(m => m.month),
  ])].sort()

  const chartData = months.map(m => ({
    month: m,
    contributions: monthly_contributions.find(x => x.month === m)?.total || 0,
    repayments:    monthly_repayments.find(x => x.month === m)?.total || 0,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">SACCO overview at a glance</p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}    label="Total Members"
          value={stats.total_members}
          iconBg="bg-blue-100" iconColor="text-blue-600" />
        <StatCard icon={PiggyBank} label="Savings Pool"
          value={K(stats.savings_pool)}
          iconBg="bg-emerald-100" iconColor="text-emerald-600" highlight />
        <StatCard icon={Landmark} label="Share Capital"
          value={K(stats.share_capital)}
          iconBg="bg-purple-100" iconColor="text-purple-600" />
        <StatCard icon={Coins}    label="Contributions This Month"
          value={K(stats.contributions_this_month)}
          iconBg="bg-amber-100" iconColor="text-amber-600" />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText}  label="Active Loans"
          value={stats.active_loans}
          sub={`${stats.pending_loans} pending approval`}
          iconBg="bg-slate-100" iconColor="text-slate-600" />
        <StatCard icon={CreditCard} label="Loan Portfolio"
          value={K(stats.total_outstanding)}
          iconBg="bg-blue-50" iconColor="text-blue-500" />
        <StatCard icon={TrendingUp} label="Collected Today"
          value={K(stats.collected_today)}
          sub={`K${Number(stats.collected_this_month).toLocaleString()} this month`}
          iconBg="bg-emerald-50" iconColor="text-emerald-500" />
        <StatCard icon={AlertTriangle} label="PAR Loans"
          value={`${stats.par_count} loans`}
          sub={`${K(stats.par_amount)} · ${stats.par_rate}% of portfolio`}
          iconBg="bg-red-100" iconColor="text-red-500"
          danger={stats.par_count > 0} />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-5">
          Contributions vs Loan Repayments — last 6 months
        </h2>
        {chartData.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gContrib" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gRepay" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={v => 'K' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v)} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(v, n) => [K(v), n === 'contributions' ? 'Contributions' : 'Repayments']}
              />
              <Area type="monotone" dataKey="contributions" stroke="#10b981" strokeWidth={2}
                fill="url(#gContrib)" name="contributions" dot={false} />
              <Area type="monotone" dataKey="repayments" stroke="#3b82f6" strokeWidth={2}
                fill="url(#gRepay)" name="repayments" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}

        <div className="flex gap-6 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-xs text-slate-500">Contributions</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            <span className="text-xs text-slate-500">Repayments</span>
          </div>
        </div>
      </div>

      {/* Recent loans */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Recent Loans</h2>
          <button onClick={() => navigate('/loans')}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
            View all <ArrowRight size={12} />
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Loan No.</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Member</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Product</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Amount</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recent_loans.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400">No loans yet.</td></tr>
            ) : recent_loans.map(loan => (
              <tr key={loan.id} className="hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/loans/${loan.id}`)}>
                <td className="px-6 py-3.5 font-mono text-slate-600 text-xs">{loan.loan_no}</td>
                <td className="px-6 py-3.5 font-medium text-slate-800">
                  {loan.borrower?.first_name} {loan.borrower?.last_name}
                </td>
                <td className="px-6 py-3.5 text-slate-500">{loan.loan_product?.name}</td>
                <td className="px-6 py-3.5 text-right font-medium text-slate-700">
                  K{Number(loan.principal_amount).toLocaleString()}
                </td>
                <td className="px-6 py-3.5">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[loan.status]}`}>
                    {loan.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
