import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, MapPin, Briefcase, Printer, CheckCircle, XCircle, Loader } from 'lucide-react'
import api from '../../api/axios'
import DocumentsPanel from '../../components/ui/DocumentsPanel'
import SharesPanel from './SharesPanel'
import ContributionsPanel from './ContributionsPanel'

const STATUS_COLORS = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  active:   'bg-green-100 text-green-700',
  closed:   'bg-gray-100 text-gray-500',
  defaulted:'bg-red-100 text-red-700',
  rejected: 'bg-red-50 text-red-400',
}

const TABS = ['Loans', 'Shares', 'Contributions', 'Documents']

export default function BorrowerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [borrower, setBorrower] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Loans')
  const [approving, setApproving] = useState(false)
  const [memberCreds, setMemberCreds] = useState(null) // { password, email }

  useEffect(() => {
    api.get(`/borrowers/${id}`).then(r => setBorrower(r.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-gray-400 text-sm py-10 text-center">Loading…</div>
  if (!borrower) return null

  const activeLoans = borrower.loans?.filter(l => l.status === 'active') || []
  const totalBorrowed = borrower.loans?.reduce((s, l) => s + Number(l.principal_amount), 0) || 0

  const updateStatus = async (status) => {
    setApproving(true)
    try {
      const res = await api.patch(`/borrowers/${id}`, { status })
      setBorrower(prev => ({ ...prev, status: res.data.status }))
      if (res.data.generated_password) {
        setMemberCreds({ password: res.data.generated_password, email: res.data.member_email })
      }
    } finally {
      setApproving(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/borrowers')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">
              {borrower.first_name} {borrower.last_name}
            </h1>
            {borrower.status && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${STATUS_COLORS[borrower.status] || 'bg-gray-100 text-gray-500'}`}>
                {borrower.status}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{borrower.borrower_no}</p>
        </div>

        {borrower.status === 'pending' && (
          <div className="flex items-center gap-2">
            {approving ? (
              <Loader size={18} className="animate-spin text-gray-400" />
            ) : (
              <>
                <button onClick={() => updateStatus('active')}
                  className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                  <CheckCircle size={15} /> Approve
                </button>
                <button onClick={() => updateStatus('rejected')}
                  className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100">
                  <XCircle size={15} /> Reject
                </button>
              </>
            )}
          </div>
        )}

        <a href={`/borrowers/${id}/statement`} target="_blank" rel="noreferrer"
          className="flex items-center gap-2 border border-gray-300 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
          <Printer size={15} /> Statement
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Personal Info</h2>
            <div className="space-y-3 text-sm">
              {borrower.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={14} className="text-gray-400" /> {borrower.phone}
                </div>
              )}
              {borrower.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={14} className="text-gray-400" /> {borrower.email}
                </div>
              )}
              {(borrower.address || borrower.city) && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={14} className="text-gray-400" />
                  {[borrower.address, borrower.city].filter(Boolean).join(', ')}
                </div>
              )}
              {borrower.employment_status && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase size={14} className="text-gray-400" />
                  <span className="capitalize">{borrower.employment_status.replace('_', ' ')}</span>
                  {borrower.employer && ` — ${borrower.employer}`}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs text-gray-500">
              <div><span className="block text-gray-400">National ID</span>{borrower.national_id || '—'}</div>
              <div><span className="block text-gray-400">Gender</span><span className="capitalize">{borrower.gender || '—'}</span></div>
              <div><span className="block text-gray-400">Date of Birth</span>{borrower.dob || '—'}</div>
              <div><span className="block text-gray-400">Monthly Income</span>{borrower.monthly_income ? `K${Number(borrower.monthly_income).toLocaleString()}` : '—'}</div>
              <div><span className="block text-gray-400">Monthly Savings Commitment</span>{borrower.monthly_savings_commitment ? `K${Number(borrower.monthly_savings_commitment).toLocaleString()}` : '—'}</div>
              {borrower.referred_by && <div><span className="block text-gray-400">Referred By</span>{borrower.referred_by}</div>}
            </div>
          </div>

          {/* Next of kin */}
          {borrower.next_of_kin?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Next of Kin</h2>
              {borrower.next_of_kin.map((nok, i) => (
                <div key={i} className="text-sm text-gray-600 space-y-0.5">
                  <p className="font-medium text-gray-800">{nok.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{nok.relationship}</p>
                  <p>{nok.phone}</p>
                  {i < borrower.next_of_kin.length - 1 && <hr className="my-2 border-gray-100" />}
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Loan Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total loans</span>
                <span className="font-medium">{borrower.loans?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Active loans</span>
                <span className="font-medium text-green-600">{activeLoans.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total borrowed</span>
                <span className="font-medium">K{totalBorrowed.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — tab content */}
        <div className="lg:col-span-2">
          {tab === 'Loans' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-800">Loan History</h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Loan No.</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Principal</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Outstanding</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {!borrower.loans?.length ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-400">No loans yet.</td></tr>
                  ) : borrower.loans.map(loan => (
                    <tr key={loan.id} className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/loans/${loan.id}`)}>
                      <td className="px-4 py-3 font-mono text-gray-700">{loan.loan_no}</td>
                      <td className="px-4 py-3 text-gray-600">{loan.loan_product?.name}</td>
                      <td className="px-4 py-3 text-right">K{Number(loan.principal_amount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">K{Number(loan.outstanding_balance).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[loan.status] || ''}`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{loan.application_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'Shares' && <SharesPanel memberId={id} />}

          {tab === 'Contributions' && <ContributionsPanel memberId={id} />}

          {tab === 'Documents' && <DocumentsPanel entityType="borrower" entityId={id} />}
        </div>
      </div>

      {/* Generated password modal */}
      {memberCreds && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900 mb-1">Member Approved!</h2>
            <p className="text-sm text-gray-500 mb-4">
              A portal account has been created. Share these login details with the member.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-left">
              <div className="text-xs text-gray-400 mb-1">Login Email</div>
              <div className="font-mono text-sm text-gray-800 mb-3 break-all">{memberCreds.email}</div>
              <div className="text-xs text-gray-400 mb-1">Temporary Password</div>
              <div className="font-mono text-2xl font-bold text-emerald-700 tracking-widest">{memberCreds.password}</div>
            </div>
            <p className="text-xs text-gray-400 mb-4">The member should change this password after first login.</p>
            <button
              onClick={() => setMemberCreds(null)}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
