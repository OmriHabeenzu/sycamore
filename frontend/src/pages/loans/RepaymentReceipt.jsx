import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api/axios'

export default function RepaymentReceipt() {
  const { id } = useParams()
  const [repayment, setRepayment] = useState(null)
  const [company, setCompany]     = useState(null)

  useEffect(() => {
    Promise.all([
      api.get(`/repayments/${id}`),
      api.get('/settings/company'),
    ]).then(([rRes, cRes]) => {
      setRepayment(rRes.data)
      setCompany(cRes.data)
    })
  }, [id])

  useEffect(() => {
    if (repayment && company) setTimeout(() => window.print(), 400)
  }, [repayment, company])

  if (!repayment || !company) return (
    <div className="text-gray-400 text-sm text-center py-20">Preparing receipt…</div>
  )

  const loan     = repayment.loan
  const borrower = loan?.borrower

  return (
    /* Outer wrapper — centers on screen but fits a half-A4 slip */
    <div className="flex justify-center items-start min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white print:block">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow print:shadow-none print:rounded-none font-sans text-sm text-gray-800">

        {/* Header */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
          <h1 className="text-xl font-bold text-gray-900">{company.name}</h1>
          {company.address && <p className="text-xs text-gray-500">{company.address}</p>}
          {company.phone   && <p className="text-xs text-gray-500">{company.phone}</p>}
          <p className="text-lg font-bold text-gray-700 mt-3 tracking-widest uppercase">
            Payment Receipt
          </p>
        </div>

        {/* Receipt meta */}
        <div className="flex justify-between text-xs text-gray-500 mb-4">
          <span>Receipt No: <strong className="text-gray-800 font-mono">{repayment.receipt_no || `RPT-${repayment.id}`}</strong></span>
          <span>Date: <strong className="text-gray-800">{repayment.payment_date}</strong></span>
        </div>

        {/* Borrower + loan info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Borrower</span>
            <span className="font-medium">{borrower?.first_name} {borrower?.last_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Loan No</span>
            <span className="font-mono font-medium">{loan?.loan_no}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Product</span>
            <span>{loan?.loan_product?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Method</span>
            <span className="capitalize">{repayment.payment_method?.replace('_', ' ')}</span>
          </div>
          {repayment.reference_number && (
            <div className="flex justify-between">
              <span className="text-gray-500">Reference</span>
              <span className="font-mono">{repayment.reference_number}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Received By</span>
            <span>{repayment.received_by?.name || '—'}</span>
          </div>
        </div>

        {/* Allocation breakdown */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
          <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Allocation
          </div>
          <div className="divide-y divide-gray-100">
            {[
              { label: 'Principal',  value: repayment.principal_amount },
              { label: 'Interest',   value: repayment.interest_amount },
              { label: 'Fees',       value: repayment.fee_amount },
              { label: 'Penalties',  value: repayment.penalty_amount },
            ].map(row => (
              Number(row.value) > 0 && (
                <div key={row.label} className="flex justify-between px-3 py-2 text-sm">
                  <span className="text-gray-600">{row.label}</span>
                  <span>K{Number(row.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center bg-blue-600 text-white rounded-lg px-4 py-3 mb-4">
          <span className="font-semibold text-sm">Total Received</span>
          <span className="text-xl font-bold">
            K{Number(repayment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Outstanding after payment */}
        <div className="flex justify-between text-xs text-gray-500 mb-4">
          <span>Outstanding Balance</span>
          <span className="font-semibold text-gray-800">
            K{Number(loan?.outstanding_balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        {repayment.notes && (
          <p className="text-xs text-gray-500 italic mb-4">Note: {repayment.notes}</p>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 border-t border-gray-200 pt-3">
          Thank you for your payment.<br />
          {company.name} · {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
