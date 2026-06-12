import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Eye } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/ui/Modal'
import LoanForm from './LoanForm'

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  approved:   'bg-blue-100 text-blue-700',
  rejected:   'bg-red-100 text-red-600',
  active:     'bg-green-100 text-green-700',
  closed:     'bg-gray-100 text-gray-500',
  defaulted:  'bg-red-100 text-red-700',
  written_off:'bg-gray-100 text-gray-400',
}

const STATUSES = ['all', 'pending', 'approved', 'active', 'closed', 'defaulted']

export default function Loans() {
  const navigate = useNavigate()
  const [loans, setLoans] = useState([])
  const [meta, setMeta] = useState({})
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/loans', {
        params: { search, status: status === 'all' ? '' : status, page },
      })
      setLoans(data.data)
      setMeta(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search, status, page])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Loans</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> New Loan
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative max-w-xs flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search loan no, borrower…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-1">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1) }}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                status === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Loan No.</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Borrower</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Principal</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Outstanding</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading…</td></tr>
            ) : loans.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">No loans found.</td></tr>
            ) : loans.map(loan => (
              <tr key={loan.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-gray-700">{loan.loan_no}</td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {loan.borrower?.first_name} {loan.borrower?.last_name}
                </td>
                <td className="px-4 py-3 text-gray-600">{loan.loan_product?.name}</td>
                <td className="px-4 py-3 text-right text-gray-800">
                  K{Number(loan.principal_amount).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-gray-800">
                  K{Number(loan.outstanding_balance).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[loan.status] || ''}`}>
                    {loan.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => navigate(`/loans/${loan.id}`)}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
            <span>Page {meta.current_page} of {meta.last_page}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50">Prev</button>
              <button disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <Modal title="New Loan Application" onClose={() => setShowForm(false)}>
          <LoanForm onSuccess={() => { setShowForm(false); load() }} />
        </Modal>
      )}
    </div>
  )
}
