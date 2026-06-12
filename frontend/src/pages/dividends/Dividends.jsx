import { useEffect, useState } from 'react'
import { ChevronRight, Calculator, CheckCircle, Banknote } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/ui/Modal'

const K = v => `K${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const STATUS = {
  draft:       { label: 'Draft',       cls: 'bg-slate-100 text-slate-600' },
  approved:    { label: 'Approved',    cls: 'bg-blue-100 text-blue-700' },
  distributed: { label: 'Distributed', cls: 'bg-emerald-100 text-emerald-700' },
}

export default function Dividends() {
  const [dividends, setDividends] = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(null) // 'calculate' | 'detail'
  const [selected, setSelected]   = useState(null)
  const [preview, setPreview]     = useState(null)
  const [calcYear, setCalcYear]   = useState(new Date().getFullYear())
  const [calcLoading, setCalcLoading] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [detail, setDetail]       = useState(null)

  async function load() {
    setLoading(true)
    try { const { data } = await api.get('/dividends'); setDividends(data) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleCalculate() {
    setCalcLoading(true); setPreview(null)
    try {
      const { data } = await api.post('/dividends/calculate', { year: calcYear })
      setPreview(data)
    } catch (e) { alert(e.response?.data?.message || 'Failed') }
    finally { setCalcLoading(false) }
  }

  async function handleSave() {
    if (!preview) return
    setSaving(true)
    try {
      await api.post('/dividends', {
        year:                 preview.year,
        total_surplus:        preview.surplus,
        distributable_amount: preview.surplus,
        per_share_rate:       preview.per_share_rate,
      })
      setModal(null); setPreview(null); load()
    } catch (e) { alert(e.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  async function openDetail(d) {
    setSelected(d)
    const { data } = await api.get(`/dividends/${d.id}`)
    setDetail(data)
    setModal('detail')
  }

  async function handleApprove() {
    await api.post(`/dividends/${selected.id}/approve`)
    setModal(null); load()
  }

  async function handleDistribute() {
    if (!confirm('Mark all allocations as paid and distribute?')) return
    await api.post(`/dividends/${selected.id}/distribute`)
    setModal(null); load()
  }

  const totalDistributed = dividends.filter(d => d.status === 'distributed').reduce((s, d) => s + d.distributable_amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dividends</h1>
          <p className="text-sm text-slate-500 mt-0.5">Year-end surplus distribution to members</p>
        </div>
        <button onClick={() => { setPreview(null); setModal('calculate') }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
          <Calculator size={16} /> Calculate Dividend
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Declared', value: dividends.length, sub: 'years' },
          { label: 'Total Distributed', value: K(totalDistributed), sub: 'to members' },
          { label: 'Latest Year', value: dividends[0]?.year ?? '—', sub: dividends[0] ? STATUS[dividends[0].status].label : '' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-slate-800">{c.value}</p>
            {c.sub && <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading…</div>
        ) : dividends.length === 0 ? (
          <div className="text-center py-12">
            <Banknote size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No dividends declared yet.</p>
            <p className="text-slate-400 text-xs mt-1">Click "Calculate Dividend" to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Year</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Surplus</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Distributed</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Per Share</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Members</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dividends.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => openDetail(d)}>
                  <td className="px-6 py-4 font-bold text-slate-800">{d.year}</td>
                  <td className="px-6 py-4 text-right text-slate-600">{K(d.total_surplus)}</td>
                  <td className="px-6 py-4 text-right font-semibold text-emerald-700">{K(d.distributable_amount)}</td>
                  <td className="px-6 py-4 text-right text-slate-600">K{Number(d.per_share_rate).toFixed(4)}/share</td>
                  <td className="px-6 py-4 text-slate-500">{d.allocations_count} members</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS[d.status].cls}`}>
                      {STATUS[d.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <ChevronRight size={16} className="text-slate-400 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Calculate modal */}
      {modal === 'calculate' && (
        <Modal title="Calculate Year-End Dividend" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-700 mb-1">Financial Year</label>
                <input type="number" value={calcYear} onChange={e => setCalcYear(e.target.value)} min="2000" max="2100"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="flex items-end">
                <button onClick={handleCalculate} disabled={calcLoading}
                  className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 disabled:opacity-60 transition-colors">
                  {calcLoading ? 'Calculating…' : 'Calculate'}
                </button>
              </div>
            </div>

            {preview && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total Revenue', value: K(preview.revenue), color: 'text-emerald-700' },
                    { label: 'Total Expenses', value: K(preview.expenses), color: 'text-red-600' },
                    { label: 'Net Surplus', value: K(preview.surplus), color: preview.surplus >= 0 ? 'text-emerald-700' : 'text-red-600' },
                    { label: 'Per Share Rate', value: `K${Number(preview.per_share_rate).toFixed(4)}`, color: 'text-blue-700' },
                  ].map(c => (
                    <div key={c.label} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500">{c.label}</p>
                      <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-2">
                    {preview.eligible_members} eligible members · {preview.total_shares} total shares
                  </p>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-slate-500">
                          <th className="text-left py-1">Member</th>
                          <th className="text-right py-1">Shares</th>
                          <th className="text-right py-1">Dividend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {preview.allocations.map(a => (
                          <tr key={a.borrower_id}>
                            <td className="py-1 text-slate-700">{a.member} <span className="text-slate-400">({a.member_no})</span></td>
                            <td className="py-1 text-right text-slate-600">{a.shares}</td>
                            <td className="py-1 text-right font-semibold text-emerald-700">{K(a.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {preview.surplus > 0 ? (
                  <div className="flex justify-end pt-2">
                    <button onClick={handleSave} disabled={saving}
                      className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-60">
                      <CheckCircle size={15} /> {saving ? 'Saving…' : `Save Dividend for ${preview.year}`}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-red-600 text-center">No distributable surplus for this year.</p>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Detail modal */}
      {modal === 'detail' && detail && (
        <Modal title={`${detail.year} Dividend`} onClose={() => { setModal(null); setDetail(null) }}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Year', value: detail.year },
                { label: 'Status', value: STATUS[detail.status].label },
                { label: 'Net Surplus', value: K(detail.total_surplus) },
                { label: 'Distributed', value: K(detail.distributable_amount) },
                { label: 'Per Share', value: `K${Number(detail.per_share_rate).toFixed(4)}` },
                { label: 'Members', value: detail.allocations?.length ?? 0 },
              ].map(c => (
                <div key={c.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">{c.label}</p>
                  <p className="font-semibold text-slate-800">{c.value}</p>
                </div>
              ))}
            </div>

            <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2 text-slate-500">Member</th>
                    <th className="text-right px-4 py-2 text-slate-500">Shares</th>
                    <th className="text-right px-4 py-2 text-slate-500">Amount</th>
                    <th className="text-left px-4 py-2 text-slate-500">Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detail.allocations?.map(a => (
                    <tr key={a.id}>
                      <td className="px-4 py-2 text-slate-700">{a.borrower?.first_name} {a.borrower?.last_name}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{a.shares}</td>
                      <td className="px-4 py-2 text-right font-semibold text-emerald-700">{K(a.amount)}</td>
                      <td className="px-4 py-2">
                        {a.is_paid
                          ? <span className="text-emerald-600 font-medium">Paid</span>
                          : <span className="text-slate-400">Pending</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {detail.status === 'draft' && (
                <button onClick={handleApprove}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">
                  Approve
                </button>
              )}
              {detail.status === 'approved' && (
                <button onClick={handleDistribute}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700">
                  Mark as Distributed
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
