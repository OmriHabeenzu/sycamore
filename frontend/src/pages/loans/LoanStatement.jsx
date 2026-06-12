import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api/axios'

export default function LoanStatement() {
  const { id } = useParams()
  const [loan, setLoan] = useState(null)
  const [company, setCompany] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get(`/loans/${id}`),
      api.get('/settings/company'),
    ]).then(([loanRes, compRes]) => {
      setLoan(loanRes.data)
      setCompany(compRes.data)
    })
  }, [id])

  useEffect(() => {
    if (loan && company) {
      setTimeout(() => window.print(), 400)
    }
  }, [loan, company])

  if (!loan || !company) return (
    <div className="text-gray-400 text-sm text-center py-20">Preparing statement…</div>
  )

  const totalPaid      = Number(loan.total_paid)
  const outstanding    = Number(loan.outstanding_balance)
  const totalDue       = Number(loan.total_amount_due)
  const principalAmt   = Number(loan.principal_amount)
  const totalInterest  = Number(loan.total_interest)
  const processingFee  = Number(loan.processing_fee)

  return (
    <div className="max-w-2xl mx-auto p-8 font-sans text-sm text-gray-800 print:p-4">
      {/* Letterhead */}
      <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
          {company.address && <p className="text-gray-500 text-xs mt-1">{company.address}</p>}
          {company.phone   && <p className="text-gray-500 text-xs">{company.phone}</p>}
          {company.email   && <p className="text-gray-500 text-xs">{company.email}</p>}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-700">LOAN STATEMENT</p>
          <p className="text-xs text-gray-400 mt-1">Printed: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Loan summary */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold uppercase text-gray-400 mb-3">Loan Details</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div><span className="text-gray-500">Loan No:</span> <strong>{loan.loan_no}</strong></div>
          <div><span className="text-gray-500">Status:</span> <span className="capitalize">{loan.status}</span></div>
          <div><span className="text-gray-500">Borrower:</span> {loan.borrower?.first_name} {loan.borrower?.last_name}</div>
          <div><span className="text-gray-500">Product:</span> {loan.loan_product?.name}</div>
          <div><span className="text-gray-500">Application Date:</span> {loan.application_date}</div>
          <div><span className="text-gray-500">Disbursement Date:</span> {loan.disbursement_date || '—'}</div>
          <div><span className="text-gray-500">Maturity Date:</span> {loan.maturity_date || '—'}</div>
          <div><span className="text-gray-500">Interest Method:</span> <span className="capitalize">{loan.interest_method?.replace('_', ' ')}</span></div>
          <div><span className="text-gray-500">Interest Rate:</span> {loan.interest_rate}%</div>
          <div><span className="text-gray-500">Term:</span> {loan.term} {loan.term_unit}</div>
        </div>
      </div>

      {/* Financial summary */}
      <div className="mb-6 bg-gray-50 rounded p-4 grid grid-cols-3 gap-4 text-center">
        {[
          { label: 'Principal',     value: `K${principalAmt.toLocaleString()}` },
          { label: 'Total Interest',value: `K${totalInterest.toLocaleString()}` },
          { label: 'Processing Fee',value: `K${processingFee.toLocaleString()}` },
          { label: 'Total Due',     value: `K${totalDue.toLocaleString()}` },
          { label: 'Total Paid',    value: `K${totalPaid.toLocaleString()}` },
          { label: 'Outstanding',   value: `K${outstanding.toLocaleString()}`, highlight: true },
        ].map(c => (
          <div key={c.label}>
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className={`font-bold text-base ${c.highlight ? 'text-red-600' : 'text-gray-800'}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Repayment schedule */}
      {loan.schedule?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold uppercase text-gray-400 mb-2">Repayment Schedule</h2>
          <table className="w-full text-xs border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {['#', 'Due Date', 'Principal', 'Interest', 'Total Due', 'Paid', 'Status'].map(h => (
                  <th key={h} className="px-2 py-1.5 text-left font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loan.schedule.map(row => (
                <tr key={row.id} className={`border-t border-gray-100 ${row.status === 'overdue' ? 'bg-red-50' : ''}`}>
                  <td className="px-2 py-1.5 text-gray-500">{row.installment_no}</td>
                  <td className="px-2 py-1.5">{row.due_date}</td>
                  <td className="px-2 py-1.5">K{Number(row.principal_due).toLocaleString()}</td>
                  <td className="px-2 py-1.5">K{Number(row.interest_due).toLocaleString()}</td>
                  <td className="px-2 py-1.5 font-medium">K{Number(row.total_due).toLocaleString()}</td>
                  <td className="px-2 py-1.5">K{Number(row.total_paid).toLocaleString()}</td>
                  <td className={`px-2 py-1.5 capitalize ${row.status === 'paid' ? 'text-green-700' : row.status === 'overdue' ? 'text-red-600' : 'text-gray-500'}`}>
                    {row.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment history */}
      {loan.repayments?.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase text-gray-400 mb-2">Payment History</h2>
          <table className="w-full text-xs border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {['Date', 'Amount', 'Method', 'Reference'].map(h => (
                  <th key={h} className="px-2 py-1.5 text-left font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loan.repayments.map(r => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="px-2 py-1.5">{r.payment_date}</td>
                  <td className="px-2 py-1.5 font-medium text-green-700">K{Number(r.amount).toLocaleString()}</td>
                  <td className="px-2 py-1.5 capitalize">{r.payment_method?.replace('_', ' ')}</td>
                  <td className="px-2 py-1.5 text-gray-400">{r.reference_number || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center print:fixed print:bottom-0 print:left-0 print:right-0">
        This statement was generated by {company.name} LMS &bull; {new Date().toLocaleString()}
      </div>
    </div>
  )
}
