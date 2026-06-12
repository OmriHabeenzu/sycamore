import { useEffect, useState } from 'react'
import api from '../../api/axios'

const EMPTY = {
  name: '', loan_officer_id: '', meeting_frequency: '',
  meeting_day: '', meeting_location: '',
}

export default function GroupForm({ group, onSuccess }) {
  const [users, setUsers] = useState([])
  const [form, setForm]   = useState(group ? { ...group, loan_officer_id: group.loan_officer_id || '' } : EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/settings/users').then(r => setUsers(r.data.filter(u => u.role === 'loan_officer' || u.role === 'admin')))
  }, [])

  function set(f, v) { setForm(p => ({ ...p, [f]: v })); setErrors(e => ({ ...e, [f]: null })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setErrors({})
    try {
      if (group) await api.put(`/groups/${group.id}`, form)
      else        await api.post('/groups', form)
      onSuccess()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Group Name *</label>
        <input type="text" value={form.name} onChange={e => set('name', e.target.value)} required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name[0]}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Loan Officer</label>
        <select value={form.loan_officer_id} onChange={e => set('loan_officer_id', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">— Unassigned —</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Meeting Frequency</label>
          <select value={form.meeting_frequency} onChange={e => set('meeting_frequency', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">— None —</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Meeting Day</label>
          <input type="text" value={form.meeting_day} onChange={e => set('meeting_day', e.target.value)}
            placeholder="e.g. Monday"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Meeting Location</label>
        <input type="text" value={form.meeting_location} onChange={e => set('meeting_location', e.target.value)}
          placeholder="e.g. Community Hall, Matero"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={saving}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
          {saving ? 'Saving…' : group ? 'Update Group' : 'Create Group'}
        </button>
      </div>
    </form>
  )
}
