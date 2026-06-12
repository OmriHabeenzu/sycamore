import { useEffect, useState } from 'react'
import { PiggyBank, FileText, Coins, Calendar, AlertCircle, Loader, TrendingUp } from 'lucide-react'
import api from '../../api/axios'

function StatCard({ icon: Icon, label, value, sub, color = 'emerald' }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue:    'bg-blue-50 text-blue-600',
    amber:   'bg-amber-50 text-amber-600',
    red:     'bg-red-50 text-red-600',
    purple:  'bg-purple-50 text-purple-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}

export default function MemberDashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    api.get('/my/dashboard')
      .then(r => setData(r.data))
      .catch(err => setError(err.response?.data?.message || 'Unable to load dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader className="w-7 h-7 animate-spin text-emerald-500" />
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <AlertCircle className="w-10 h-10 mb-2 text-red-400" />
      <p className="text-red-500 font-medium">{error}</p>
      <p className="text-sm mt-1">Please contact the office if this persists.</p>
    </div>
  )

  const fmt     = n => `K${Number(n || 0).toLocaleString()}`
  const fmtDate = d => d
    ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {data.member.name}</h1>
        <p className="text-sm text-gray-400 mt-0.5">Member No: {data.member.borrower_no}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={PiggyBank}
          label="Savings Balance"
          value={fmt(data.savings_balance)}
          sub={data.max_loan_allowed > 0 ? `Loan limit: ${fmt(data.max_loan_allowed)}` : undefined}
          color="emerald"
        />
        <StatCard
          icon={TrendingUp}
          label="Max Loan Allowed"
          value={fmt(data.max_loan_allowed)}
          sub="3× your savings"
          color="purple"
        />
        <StatCard icon={FileText}  label="Active Loans"  value={data.active_loans} color="blue" />
        <StatCard
          icon={Calendar}
          label="Next Payment"
          color={data.next_payment?.status === 'overdue' ? 'red' : 'amber'}
          value={data.next_payment ? fmt(data.next_payment.amount) : '—'}
          sub={data.next_payment ? `Due ${fmtDate(data.next_payment.due_date)}` : 'No active loans'}
        />
      </div>

      {data.next_payment?.status === 'overdue' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Overdue Payment</p>
            <p className="text-sm text-red-600">
              You have a payment of {fmt(data.next_payment.amount)} that was due on {fmtDate(data.next_payment.due_date)}.
              Please contact the office.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Account Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="block text-gray-400 text-xs mb-0.5">Member Number</span>
            <span className="font-medium text-gray-800">{data.member.borrower_no}</span>
          </div>
          <div>
            <span className="block text-gray-400 text-xs mb-0.5">Phone</span>
            <span className="font-medium text-gray-800">{data.member.phone || '—'}</span>
          </div>
          <div>
            <span className="block text-gray-400 text-xs mb-0.5">Total Loans</span>
            <span className="font-medium text-gray-800">{data.total_loans}</span>
          </div>
          <div>
            <span className="block text-gray-400 text-xs mb-0.5">Status</span>
            <span className={`capitalize font-medium ${data.member.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
              {data.member.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
