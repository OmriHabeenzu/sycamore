import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api/axios'

const STATUS_COLORS_TEXT = {
  active:     'text-emerald-700',
  closed:     'text-slate-500',
  defaulted:  'text-red-600',
  written_off:'text-slate-400',
  pending:    'text-amber-700',
  approved:   'text-blue-600',
}

const K = v => `K${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function BorrowerStatement() {
  const { id } = useParams()
  const [member, setMember]   = useState(null)
  const [company, setCompany] = useState(null)
  const [shares, setShares]   = useState(null)
  const [contribs, setContribs] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get(`/borrowers/${id}`),
      api.get('/settings/company'),
      api.get(`/members/${id}/shares`).catch(() => ({ data: null })),
      api.get(`/members/${id}/contributions`).catch(() => ({ data: null })),
    ]).then(([mRes, cRes, sRes, ctRes]) => {
      setMember(mRes.data)
      setCompany(cRes.data)
      setShares(sRes.data)
      setContribs(ctRes.data)
    })
  }, [id])

  useEffect(() => {
    if (member && company) setTimeout(() => window.print(), 500)
  }, [member, company])

  if (!member || !company) return (
    <div className="text-slate-400 text-sm text-center py-20">Preparing statement…</div>
  )

  const totalBorrowed = member.loans?.reduce((s, l) => s + Number(l.principal_amount), 0) ?? 0
  const totalPaid     = member.loans?.reduce((s, l) => s + Number(l.total_paid), 0) ?? 0
  const outstanding   = member.loans?.reduce((s, l) => s + Number(l.outstanding_balance), 0) ?? 0
  const activeLoans   = member.loans?.filter(l => l.status === 'active').length ?? 0

  return (
    <div className="max-w-2xl mx-auto p-8 font-sans text-sm text-slate-800 print:p-4">
      {/* Letterhead */}
      <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
          <p className="text-xs text-emerald-700 font-medium mt-0.5">SACCO Platform</p>
          {company.address && <p className="text-slate-500 text-xs mt-1">{company.address}</p>}
          {company.phone   && <p className="text-slate-500 text-xs">{company.phone}</p>}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-slate-700">MEMBER STATEMENT</p>
          <p className="text-xs text-slate-400 mt-1">Printed: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Member profile */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold uppercase text-slate-400 tracking-widest mb-3">Member Profile</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <div><span className="text-slate-500">Name:</span> <strong>{member.first_name} {member.last_name}</strong></div>
          <div><span className="text-slate-500">Member No:</span> {member.borrower_no}</div>
          <div><span className="text-slate-500">Phone:</span> {member.phone}</div>
          <div><span className="text-slate-500">National ID:</span> {member.national_id || '—'}</div>
          <div><span className="text-slate-500">Address:</span> {member.address || '—'}</div>
          <div><span className="text-slate-500">Employer:</span> {member.employer || '—'}</div>
        </div>
      </div>

      {/* Summary grid */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        {[
          { label: 'Savings Balance', value: K(member.savings_accounts?.reduce((s, a) => s + Number(a.balance), 0) ?? 0), accent: true },
          { label: 'Share Value', value: shares ? K(shares.shares * shares.amount_per_share) : 'K0.00', accent: true },
          { label: 'Total Contributions', value: K(contribs?.total ?? 0) },
          { label: 'Loan Outstanding', value: K(outstanding), red: outstanding > 0 },
        ].map(c => (
          <div key={c.label} className={`rounded-lg p-3 text-center ${c.accent ? 'bg-emerald-50' : c.red && outstanding > 0 ? 'bg-red-50' : 'bg-slate-50'}`}>
            <p className="text-xs text-slate-500">{c.label}</p>
            <p className={`font-bold text-base mt-0.5 ${c.accent ? 'text-emerald-700' : c.red && outstanding > 0 ? 'text-red-600' : 'text-slate-800'}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Shares */}
      {shares && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold uppercase text-slate-400 tracking-widest mb-2">Share Account</h2>
          <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-3 gap-3 text-center text-xs">
            <div><p className="text-slate-500">Shares Held</p><p className="font-bold text-slate-800">{shares.shares}</p></div>
            <div><p className="text-slate-500">Per Share</p><p className="font-bold text-slate-800">{K(shares.amount_per_share)}</p></div>
            <div><p className="text-slate-500">Total Value</p><p className="font-bold text-emerald-700">{K(shares.shares * shares.amount_per_share)}</p></div>
          </div>
        </div>
      )}

      {/* Contributions summary */}
      {contribs && contribs.contributions?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold uppercase text-slate-400 tracking-widest mb-2">Contributions Summary</h2>
          <div className="bg-slate-50 rounded-lg p-3 flex justify-between items-center text-xs">
            <span className="text-slate-600">{contribs.contributions.length} payments recorded</span>
            <span className="font-bold text-emerald-700 text-sm">{K(contribs.total)}</span>
          </div>
        </div>
      )}

      {/* Loan history */}
      {member.loans?.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase text-slate-400 tracking-widest mb-2">Loan History</h2>
          <table className="w-full text-xs border border-slate-200 rounded">
            <thead className="bg-slate-100">
              <tr>
                {['Loan No', 'Product', 'Principal', 'Total Due', 'Paid', 'Outstanding', 'Status'].map(h => (
                  <th key={h} className="px-2 py-1.5 text-left font-medium text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {member.loans.map(l => (
                <tr key={l.id} className="border-t border-slate-100">
                  <td className="px-2 py-1.5 font-mono">{l.loan_no}</td>
                  <td className="px-2 py-1.5">{l.loan_product?.name}</td>
                  <td className="px-2 py-1.5">{K(l.principal_amount)}</td>
                  <td className="px-2 py-1.5">{K(l.total_amount_due)}</td>
                  <td className="px-2 py-1.5 text-emerald-700">{K(l.total_paid)}</td>
                  <td className="px-2 py-1.5 font-medium">{K(l.outstanding_balance)}</td>
                  <td className={`px-2 py-1.5 capitalize font-medium ${STATUS_COLORS_TEXT[l.status] || ''}`}>
                    {l.status}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-300">
              <tr>
                <td colSpan={2} className="px-2 py-1.5 font-semibold text-right">Totals:</td>
                <td className="px-2 py-1.5 font-semibold">{K(totalBorrowed)}</td>
                <td className="px-2 py-1.5" />
                <td className="px-2 py-1.5 font-semibold text-emerald-700">{K(totalPaid)}</td>
                <td className="px-2 py-1.5 font-semibold text-red-600">{K(outstanding)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-slate-200 text-xs text-slate-400 text-center">
        Generated by {company.name} · Sycamore SACCO Platform · {new Date().toLocaleString()}
      </div>
    </div>
  )
}
