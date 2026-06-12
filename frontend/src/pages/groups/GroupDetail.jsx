import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, UserPlus, Trash2, Pencil, Eye } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/ui/Modal'
import GroupForm from './GroupForm'

const ROLE_COLORS = {
  leader:    'bg-blue-100 text-blue-700',
  secretary: 'bg-purple-100 text-purple-700',
  member:    'bg-gray-100 text-gray-600',
}

export default function GroupDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [group, setGroup]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal]   = useState(null) // 'edit' | 'addMember'
  const [borrowers, setBorrowers] = useState([])
  const [memberForm, setMemberForm] = useState({ borrower_id: '', role: 'member', joined_at: new Date().toISOString().slice(0, 10) })
  const [addErr, setAddErr] = useState('')
  const [addSaving, setAddSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get(`/groups/${id}`)
      setGroup(data)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    api.get('/borrowers', { params: { page: 1 } }).then(r => setBorrowers(r.data.data))
  }, [id])

  async function handleAddMember(e) {
    e.preventDefault()
    setAddSaving(true); setAddErr('')
    try {
      await api.post(`/groups/${id}/members`, memberForm)
      setModal(null); load()
    } catch (err) {
      setAddErr(err.response?.data?.message || 'Failed to add member.')
    } finally { setAddSaving(false) }
  }

  async function handleRemoveMember(borrowerId) {
    if (!confirm('Remove this member from the group?')) return
    await api.delete(`/groups/${id}/members/${borrowerId}`)
    load()
  }

  if (loading) return <div className="text-gray-400 text-sm py-10 text-center">Loading…</div>
  if (!group)  return null

  const memberIds = new Set(group.members?.map(m => m.id))
  const available = borrowers.filter(b => !memberIds.has(b.id))

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/groups')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">{group.name}</h1>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${group.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {group.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {group.group_no} &bull; Officer: {group.loan_officer?.name || 'Unassigned'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModal('addMember')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <UserPlus size={16} /> Add Member
          </button>
          <button onClick={() => setModal('edit')}
            className="flex items-center gap-2 border border-gray-300 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
            <Pencil size={15} /> Edit
          </button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Members',     value: group.members?.length ?? 0 },
          { label: 'Loan Cycles', value: group.group_loans?.length ?? 0 },
          { label: 'Meeting',     value: group.meeting_frequency ? `${group.meeting_frequency}${group.meeting_day ? ` · ${group.meeting_day}` : ''}` : '—' },
          { label: 'Location',    value: group.meeting_location || '—' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className="text-base font-bold text-gray-800 capitalize">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-800">Members ({group.members?.length})</h2>
          </div>
          {group.members?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No members yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {group.members.map(m => (
                <div key={m.id} className="px-4 py-2.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${ROLE_COLORS[m.pivot?.role || 'member']}`}>
                        {m.pivot?.role || 'member'}
                      </span>
                      <p className="text-sm font-medium text-gray-800">{m.first_name} {m.last_name}</p>
                    </div>
                    <p className="text-xs text-gray-400">{m.borrower_no} &bull; {m.phone}</p>
                  </div>
                  <div className="flex gap-2 ml-4 shrink-0">
                    <Link to={`/borrowers/${m.id}`} className="text-gray-400 hover:text-blue-600">
                      <Eye size={14} />
                    </Link>
                    <button onClick={() => handleRemoveMember(m.id)} className="text-gray-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loan Cycles */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-800">Loan Cycles ({group.group_loans?.length})</h2>
          </div>
          {group.group_loans?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No loan cycles yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {group.group_loans.map(gl => (
                <div key={gl.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Cycle {gl.cycle_no}</p>
                      <p className="text-xs text-gray-500">{gl.loan_product?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-700">K{Number(gl.total_amount).toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                        gl.status === 'active' ? 'bg-green-100 text-green-700' :
                        gl.status === 'closed' ? 'bg-gray-100 text-gray-500' : 'bg-yellow-100 text-yellow-700'
                      }`}>{gl.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {modal === 'edit' && (
        <Modal title="Edit Group" onClose={() => setModal(null)}>
          <GroupForm group={group} onSuccess={() => { setModal(null); load() }} />
        </Modal>
      )}

      {/* Add member modal */}
      {modal === 'addMember' && (
        <Modal title="Add Member" onClose={() => setModal(null)}>
          <form onSubmit={handleAddMember} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Member *</label>
              <select value={memberForm.borrower_id} onChange={e => setMemberForm(f => ({ ...f, borrower_id: e.target.value }))} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select member…</option>
                {available.map(b => (
                  <option key={b.id} value={b.id}>{b.first_name} {b.last_name} ({b.borrower_no})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                <select value={memberForm.role} onChange={e => setMemberForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="member">Member</option>
                  <option value="leader">Leader</option>
                  <option value="secretary">Secretary</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Joined Date *</label>
                <input type="date" value={memberForm.joined_at} onChange={e => setMemberForm(f => ({ ...f, joined_at: e.target.value }))} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            {addErr && <p className="text-xs text-red-600">{addErr}</p>}
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={addSaving}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {addSaving ? 'Adding…' : 'Add Member'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
