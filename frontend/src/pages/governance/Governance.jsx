import { useEffect, useState } from 'react'
import { Plus, Trash2, Shield, FileText } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/ui/Modal'

const ROLES = ['chairman', 'vice_chairman', 'treasurer', 'secretary', 'committee_member']
const ROLE_COLORS = {
  chairman:         'bg-purple-100 text-purple-700',
  vice_chairman:    'bg-blue-100 text-blue-700',
  treasurer:        'bg-emerald-100 text-emerald-700',
  secretary:        'bg-amber-100 text-amber-700',
  committee_member: 'bg-slate-100 text-slate-600',
}

const EMPTY_BOARD = { borrower_id: '', role: 'committee_member', appointed_date: new Date().toISOString().slice(0, 10), notes: '' }
const EMPTY_MINUTES = { meeting_date: new Date().toISOString().slice(0, 10), meeting_type: 'general', agenda: '', minutes: '', attendees_count: '' }

export default function Governance() {
  const [tab, setTab]           = useState('board')
  const [board, setBoard]       = useState([])
  const [minutes, setMinutes]   = useState([])
  const [members, setMembers]   = useState([])
  const [modal, setModal]       = useState(null)
  const [form, setForm]         = useState({})
  const [errors, setErrors]     = useState({})
  const [saving, setSaving]     = useState(false)
  const [viewMinute, setViewMinute] = useState(null)

  useEffect(() => {
    api.get('/borrowers', { params: { page: 1 } }).then(r => setMembers(r.data.data))
    loadBoard(); loadMinutes()
  }, [])

  async function loadBoard() {
    const { data } = await api.get('/governance/board')
    setBoard(data)
  }

  async function loadMinutes() {
    const { data } = await api.get('/governance/minutes')
    setMinutes(data)
  }

  function set(f, v) { setForm(p => ({ ...p, [f]: v })); setErrors(e => ({ ...e, [f]: null })) }

  async function handleSaveBoard(e) {
    e.preventDefault(); setSaving(true); setErrors({})
    try {
      await api.post('/governance/board', form)
      setModal(null); loadBoard()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
    } finally { setSaving(false) }
  }

  async function handleRemoveBoard(id) {
    if (!confirm('Remove from board?')) return
    await api.delete(`/governance/board/${id}`)
    loadBoard()
  }

  async function handleSaveMinutes(e) {
    e.preventDefault(); setSaving(true); setErrors({})
    try {
      await api.post('/governance/minutes', form)
      setModal(null); loadMinutes()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
    } finally { setSaving(false) }
  }

  async function handleDeleteMinutes(id) {
    if (!confirm('Delete this meeting record?')) return
    await api.delete(`/governance/minutes/${id}`)
    loadMinutes()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Governance</h1>
        <p className="text-sm text-slate-500 mt-0.5">Board members and meeting minutes</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[['board', 'Board Members'], ['minutes', 'Meeting Minutes']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Board Members */}
      {tab === 'board' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setForm(EMPTY_BOARD); setErrors({}); setModal('board') }}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
              <Plus size={16} /> Add Board Member
            </button>
          </div>

          {board.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 text-center py-14">
              <Shield size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No board members added yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {board.map(b => (
                <div key={b.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${ROLE_COLORS[b.role] || ROLE_COLORS.committee_member}`}>
                      {b.role.replace('_', ' ')}
                    </span>
                    <button onClick={() => handleRemoveBoard(b.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="font-semibold text-slate-800">{b.borrower?.first_name} {b.borrower?.last_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{b.borrower?.borrower_no}</p>
                  <p className="text-xs text-slate-400 mt-2">Appointed: {b.appointed_date}</p>
                  {b.notes && <p className="text-xs text-slate-500 mt-1 italic">{b.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Meeting Minutes */}
      {tab === 'minutes' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setForm(EMPTY_MINUTES); setErrors({}); setModal('minutes') }}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
              <Plus size={16} /> Record Meeting
            </button>
          </div>

          {minutes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 text-center py-14">
              <FileText size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No meetings recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {minutes.map(m => (
                <div key={m.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
                  <div className="cursor-pointer flex-1" onClick={() => setViewMinute(m)}>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                        m.meeting_type === 'agm' ? 'bg-purple-100 text-purple-700' :
                        m.meeting_type === 'special' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{m.meeting_type?.toUpperCase()}</span>
                      <p className="text-sm font-semibold text-slate-800">{m.meeting_date}</p>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-1">{m.agenda}</p>
                    {m.attendees_count && <p className="text-xs text-slate-400 mt-0.5">{m.attendees_count} attendees</p>}
                  </div>
                  <button onClick={() => handleDeleteMinutes(m.id)} className="text-slate-300 hover:text-red-500 ml-4 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add board member modal */}
      {modal === 'board' && (
        <Modal title="Add Board Member" onClose={() => setModal(null)}>
          <form onSubmit={handleSaveBoard} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Member *</label>
              <select value={form.borrower_id} onChange={e => set('borrower_id', e.target.value)} required
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Select member…</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name} ({m.borrower_no})</option>)}
              </select>
              {errors.borrower_id && <p className="text-xs text-red-600 mt-1">{errors.borrower_id[0]}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Role *</label>
              <select value={form.role} onChange={e => set('role', e.target.value)} required
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Appointed Date *</label>
              <input type="date" value={form.appointed_date} onChange={e => set('appointed_date', e.target.value)} required
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
              <input type="text" value={form.notes} onChange={e => set('notes', e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving}
                className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-60">
                {saving ? 'Saving…' : 'Add Member'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Record minutes modal */}
      {modal === 'minutes' && (
        <Modal title="Record Meeting" onClose={() => setModal(null)}>
          <form onSubmit={handleSaveMinutes} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Date *</label>
                <input type="date" value={form.meeting_date} onChange={e => set('meeting_date', e.target.value)} required
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Meeting Type *</label>
                <select value={form.meeting_type} onChange={e => set('meeting_type', e.target.value)} required
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="general">General</option>
                  <option value="agm">AGM</option>
                  <option value="special">Special</option>
                  <option value="board">Board</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Agenda *</label>
              <input type="text" value={form.agenda} onChange={e => set('agenda', e.target.value)} required
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Attendees Count</label>
              <input type="number" value={form.attendees_count} onChange={e => set('attendees_count', e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Minutes / Notes</label>
              <textarea value={form.minutes} onChange={e => set('minutes', e.target.value)} rows={4}
                placeholder="Key decisions, resolutions, action items…"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving}
                className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-60">
                {saving ? 'Saving…' : 'Save Record'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View minutes */}
      {viewMinute && (
        <Modal title={`Meeting — ${viewMinute.meeting_date}`} onClose={() => setViewMinute(null)}>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-slate-500">Type:</span> <span className="capitalize font-medium">{viewMinute.meeting_type}</span></div>
              <div><span className="text-slate-500">Attendees:</span> <span className="font-medium">{viewMinute.attendees_count || '—'}</span></div>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Agenda</p>
              <p className="text-slate-800 font-medium">{viewMinute.agenda}</p>
            </div>
            {viewMinute.minutes && (
              <div>
                <p className="text-slate-500 text-xs mb-1">Minutes / Notes</p>
                <p className="text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-xl p-3 text-sm">{viewMinute.minutes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
