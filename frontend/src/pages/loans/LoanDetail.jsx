import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, Banknote, PlusCircle, Printer, TrendingUp, RefreshCw } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/ui/Modal'
import DisburseForm from './DisburseForm'
import RepaymentForm from './RepaymentForm'
import TopUpForm from './TopUpForm'
import RestructureForm from './RestructureForm'
import GuarantorsPanel from './GuarantorsPanel'
import CollateralPanel from './CollateralPanel'
import ChargesPanel from './ChargesPanel'
import DocumentsPanel from '../../components/ui/DocumentsPanel'

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  approved:   'bg-blue-100 text-blue-700',
  rejected:   'bg-red-100 text-red-600',
  active:     'bg-green-100 text-green-700',
  closed:     'bg-gray-100 text-gray-500',
  defaulted:  'bg-red-100 text-red-700',
  written_off:'bg-gray-100 text-gray-400',
}

const SCHEDULE_STATUS = {
  pending: 'text-gray-500',
  partial: 'text-yellow-600',
  paid:    'text-green-600',
  overdue: 'text-red-600',
}

export default function LoanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loan, setLoan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // 'disburse' | 'repayment' | 'topup' | 'restructure'

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get(`/loans/${id}`)
      setLoan(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function handleApprove() {
    if (!confirm('Approve this loan?')) return
    await api.post(`/loans/${id}/approve`)
    load()
  }

  async function handleReject() {
    const reason = prompt('Rejection reason (optional):')
    if (reason === null) return
    await api.post(`/loans/${id}/reject`, { reason })
    load()
  }

  if (loading) return <div className="text-gray-400 text-sm py-10 text-center">Loading…</div>
  if (!loan) return null

  const canApprove    = loan.status === 'pending'
  const canDisburse   = loan.status === 'approved'
  const canRepay      = loan.status === 'active'
  const canModify     = loan.status === 'active'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/loans')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800 font-mono">{loan.loan_no}</h1>
            <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[loan.status]}`}>
              {loan.status}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {loan.borrower?.first_name} {loan.borrower?.last_name} &bull; {loan.loan_product?.name}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <a href={`/loans/${id}/statement`} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 border border-gray-300 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
            <Printer size={15} /> Statement
          </a>
          {canApprove && (
            <>
              <button onClick={handleApprove}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                <CheckCircle size={16} /> Approve
              </button>
              <button onClick={handleReject}
                className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100">
                <XCircle size={16} /> Reject
              </button>
            </>
          )}
          {canDisburse && (
            <button onClick={() => setModal('disburse')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              <Banknote size={16} /> Disburse
            </button>
          )}
          {canRepay && (
            <button onClick={() => setModal('repayment')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              <PlusCircle size={16} /> Record Payment
            </button>
          )}
          {canModify && (
            <>
              <button onClick={() => setModal('topup')}
                className="flex items-center gap-2 border border-gray-300 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
                <TrendingUp size={15} /> Top-up
              </button>
              <button onClick={() => setModal('restructure')}
                className="flex items-center gap-2 border border-orange-300 text-orange-600 px-3 py-2 rounded-lg text-sm hover:bg-orange-50">
                <RefreshCw size={15} /> Restructure
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Principal',    value: `K${Number(loan.principal_amount).toLocaleString()}` },
          { label: 'Total Due',    value: `K${Number(loan.total_amount_due).toLocaleString()}` },
          { label: 'Total Paid',   value: `K${Number(loan.total_paid).toLocaleString()}` },
          { label: 'Outstanding',  value: `K${Number(loan.outstanding_balance).toLocaleString()}`, highlight: true },
        ].map(c => (
          <div key={c.label} className={`bg-white rounded-xl border p-4 ${c.highlight ? 'border-blue-200' : 'border-gray-200'}`}>
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-xl font-bold ${c.highlight ? 'text-blue-600' : 'text-gray-800'}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {loan.is_overdue && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
          ⚠ This loan is <strong>{loan.days_in_arrears} days</strong> in arrears.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Repayment Schedule */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-800">Repayment Schedule</h2>
          </div>
          {loan.schedule?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Schedule generated at disbursement.</p>
          ) : (
            <div className="overflow-auto max-h-80">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 text-gray-500">#</th>
                    <th className="text-left px-3 py-2 text-gray-500">Due</th>
                    <th className="text-right px-3 py-2 text-gray-500">Principal</th>
                    <th className="text-right px-3 py-2 text-gray-500">Interest</th>
                    <th className="text-right px-3 py-2 text-gray-500">Total</th>
                    <th className="text-right px-3 py-2 text-gray-500">Paid</th>
                    <th className="text-left px-3 py-2 text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loan.schedule.map(row => (
                    <tr key={row.id} className={row.status === 'overdue' ? 'bg-red-50' : ''}>
                      <td className="px-3 py-2 text-gray-400">{row.installment_no}</td>
                      <td className="px-3 py-2">{row.due_date}</td>
                      <td className="px-3 py-2 text-right">K{Number(row.principal_due).toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">K{Number(row.interest_due).toLocaleString()}</td>
                      <td className="px-3 py-2 text-right font-medium">K{Number(row.total_due).toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">K{Number(row.total_paid).toLocaleString()}</td>
                      <td className={`px-3 py-2 capitalize font-medium ${SCHEDULE_STATUS[row.status]}`}>
                        {row.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Repayments Made */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-800">Payments Received</h2>
          </div>
          {loan.repayments?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No payments recorded yet.</p>
          ) : (
            <div className="overflow-auto max-h-80">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 text-gray-500">Receipt</th>
                    <th className="text-left px-3 py-2 text-gray-500">Date</th>
                    <th className="text-right px-3 py-2 text-gray-500">Amount</th>
                    <th className="text-left px-3 py-2 text-gray-500">Method</th>
                    <th className="text-left px-3 py-2 text-gray-500">Ref</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loan.repayments.map(r => (
                    <tr key={r.id}>
                      <td className="px-3 py-2 font-mono text-gray-500">{r.receipt_no || '—'}</td>
                      <td className="px-3 py-2">{r.payment_date}</td>
                      <td className="px-3 py-2 text-right font-medium text-green-700">
                        K{Number(r.amount).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 capitalize">{r.payment_method.replace('_', ' ')}</td>
                      <td className="px-3 py-2 text-gray-400">{r.reference_number || '—'}</td>
                      <td className="px-3 py-2">
                        <a href={`/repayments/${r.id}/receipt`} target="_blank" rel="noreferrer"
                          className="text-gray-400 hover:text-blue-600" title="Print receipt">
                          <Printer size={13} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Guarantors + Collateral */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <GuarantorsPanel loanId={id} />
        <CollateralPanel loanId={id} />
      </div>

      {/* Charges & Penalties */}
      <div className="mt-6">
        <ChargesPanel loanId={id} />
      </div>

      {/* Documents */}
      <div className="mt-6">
        <DocumentsPanel entityType="loan" entityId={id} />
      </div>

      {/* Loan details */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mt-6 text-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Loan Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-600">
          <div><span className="text-gray-400">Interest method:</span> <span className="capitalize">{loan.interest_method?.replace('_', ' ')}</span></div>
          <div><span className="text-gray-400">Interest rate:</span> {loan.interest_rate}% per period</div>
          <div><span className="text-gray-400">Frequency:</span> <span className="capitalize">{loan.repayment_frequency}</span></div>
          <div><span className="text-gray-400">Term:</span> {loan.term} {loan.term_unit}</div>
          <div><span className="text-gray-400">Application date:</span> {loan.application_date}</div>
          <div><span className="text-gray-400">Disbursement date:</span> {loan.disbursement_date || '—'}</div>
          <div><span className="text-gray-400">Maturity date:</span> {loan.maturity_date || '—'}</div>
          <div><span className="text-gray-400">Loan officer:</span> {loan.loan_officer?.name || '—'}</div>
          {loan.notes && <div className="col-span-2"><span className="text-gray-400">Notes:</span> {loan.notes}</div>}
        </div>
      </div>

      {modal === 'disburse' && (
        <Modal title="Disburse Loan" onClose={() => setModal(null)}>
          <DisburseForm loanId={id} onSuccess={() => { setModal(null); load() }} />
        </Modal>
      )}

      {modal === 'repayment' && (
        <Modal title="Record Payment" onClose={() => setModal(null)}>
          <RepaymentForm loanId={id} outstanding={loan.outstanding_balance} onSuccess={() => { setModal(null); load() }} />
        </Modal>
      )}

      {modal === 'topup' && (
        <Modal title="Loan Top-Up" onClose={() => setModal(null)}>
          <TopUpForm loanId={id} outstanding={loan.outstanding_balance} term={loan.term} onSuccess={() => { setModal(null); load() }} />
        </Modal>
      )}

      {modal === 'restructure' && (
        <Modal title="Restructure Loan" onClose={() => setModal(null)}>
          <RestructureForm loanId={id} loan={loan} onSuccess={() => { setModal(null); load() }} />
        </Modal>
      )}
    </div>
  )
}
