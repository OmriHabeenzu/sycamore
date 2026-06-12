import { useEffect, useState } from 'react'
import { Plus, Settings2 } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/ui/Modal'

const K = v => `K${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const EMPTY_CONTRIB   = { amount: '', contribution_date: new Date().toISOString().slice(0, 10), reference: '', notes: '' }
const EMPTY_SCHEDULE  = { expected_amount: '', frequency: 'monthly', start_date: new Date().toISOString().slice(0, 10) }

export default function ContributionsPanel({ memberId }) {
  const [data, setData]     = useState(null)
  const [modal, setModal]   = useState(null) // 'record' | 'schedule'
  const [form, setForm]     = useState({})
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data: res } = await api.get(`/members/${memberId}/contributions`)
    setData(res)
  }

  useEffect(() => { load() }, [memberId])

  function set(f, v) { setForm(p => ({ ...p, [f]: v })); setErrors(e => ({ ...e, [f]: null })) }

  async function handleRecord(e) {
    e.preventDefault(); setSaving(true); setErrors({}); setServerError('')
    try {
      await api.post('/contributions', { ...form, borrower_id: memberId })
      setModal(null); load()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
      else setServerError(err.response?.data?.message || err.message || 'Something went wrong.')
    } finally { setSaving(false) }
  }

  async function handleSchedule(e) {
    e.preventDefault(); setSaving(true); setErrors({}); setServerError('')
    try {
      await api.post('/contribution-schedules', { ...form, borrower_id: memberId })
      setModal(null); load()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
      else setServerError(err.response?.data?.message || err.message || 'Something went wrong.')
    } finally { setSaving(false) }
  }

  const schedule = data?.schedule

  // Compute arrears — how many expected contributions haven't been met this month
  const totalContributed = data?.total ?? 0
  const contributions    = data?.contributions ?? []

  return (
    <div className="space-y-4">
      {/* Schedule card */}
      <div className={`rounded-2xl border p-5 flex items-center justify-between ${
        schedule ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
      }`}>
        <div>
          {schedule ? (
            <>
              <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide mb-1">Active Schedule</p>
              <p className="text-lg font-bold text-slate-800">
                {K(schedule.expected_amount)} <span className="text-sm font-normal text-slate-500 capitalize">/ {schedule.frequency}</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Since {schedule.start_date}</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-600">No contribution schedule set</p>
              <p className="text-xs text-slate-400 mt-0.5">Set a regular contribution target for this member</p>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setForm(EMPTY_CONTRIB); setErrors({}); setModal('record') }}
            className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-medium hover:bg-emerald-700 transition-colors">
            <Plus size={14} /> Record
          </button>
          <button onClick={() => { setForm(schedule ? { expected_amount: schedule.expected_amount, frequency: schedule.frequency, start_date: new Date().toISOString().slice(0,10) } : EMPTY_SCHEDULE); setErrors({}); setModal('schedule') }}
            className="flex items-center gap-2 border border-slate-300 text-slate-600 px-3 py-2 rounded-xl text-xs font-medium hover:bg-white transition-colors">
            <Settings2 size={14} /> {schedule ? 'Update Schedule' : 'Set Schedule'}
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Total Contributed</p>
          <p className="text-2xl font-bold text-emerald-700">{K(totalContributed)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Total Payments</p>
          <p className="text-2xl font-bold text-slate-800">{contributions.length}</p>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Contribution History</h3>
        </div>
        {contributions.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">No contributions recorded yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-2.5 text-xs text-slate-500">Date</th>
                <th className="text-right px-5 py-2.5 text-xs text-slate-500">Amount</th>
                <th className="text-left px-5 py-2.5 text-xs text-slate-500">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contributions.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-600">{c.contribution_date}</td>
                  <td className="px-5 py-3 text-right font-semibold text-emerald-700">{K(c.amount)}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{c.reference || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Record modal */}
      {modal === 'record' && (
        <Modal title="Record Contribution" onClose={() => setModal(null)}>
          <form onSubmit={handleRecord} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Amount (K) *</label>
                <input type="number" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} required
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount[0]}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Date *</label>
                <input type="date" value={form.contribution_date} onChange={e => set('contribution_date', e.target.value)} required
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Reference</label>
              <input type="text" value={form.reference} onChange={e => set('reference', e.target.value)}
                placeholder="Receipt no., mobile money ref…"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            {schedule && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
                Expected: {K(schedule.expected_amount)} / {schedule.frequency}
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving}
                className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-60">
                {saving ? 'Saving…' : 'Record'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Schedule modal */}
      {modal === 'schedule' && (
        <Modal title="Set Contribution Schedule" onClose={() => setModal(null)}>
          <form onSubmit={handleSchedule} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Expected Amount (K) *</label>
              <input type="number" step="0.01" value={form.expected_amount} onChange={e => set('expected_amount', e.target.value)} required
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Frequency *</label>
              <select value={form.frequency} onChange={e => set('frequency', e.target.value)} required
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Start Date *</label>
              <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} required
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving}
                className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-60">
                {saving ? 'Saving…' : 'Save Schedule'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
