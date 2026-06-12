import { useEffect, useState } from 'react'
import { Plus, Pencil, KeyRound, ToggleLeft, ToggleRight } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/ui/Modal'

const ROLES = ['admin', 'manager', 'loan_officer', 'cashier']
const ROLE_LABELS = { admin: 'Admin', manager: 'Manager', loan_officer: 'Loan Officer', cashier: 'Cashier' }

const EMPTY = { name: '', email: '', phone: '', role: 'loan_officer', password: '' }

export default function UsersSettings() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [resetUser, setResetUser] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [newPassword, setNewPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try { const { data } = await api.get('/settings/users'); setUsers(data) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function openAdd() { setForm(EMPTY); setErrors({}); setEditing(null); setShowForm(true) }
  function openEdit(u) { setForm({ name: u.name, email: u.email, phone: u.phone || '', role: u.role }); setEditing(u); setErrors({}); setShowForm(true) }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true); setErrors({})
    try {
      if (editing) await api.put(`/settings/users/${editing.id}`, form)
      else await api.post('/settings/users', form)
      setShowForm(false); load()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
    } finally { setSaving(false) }
  }

  async function handleToggle(user) {
    await api.put(`/settings/users/${user.id}`, { is_active: !user.is_active })
    load()
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post(`/settings/users/${resetUser.id}/reset-password`, { password: newPassword })
      setResetUser(null); setNewPassword('')
    } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{users.length} staff members</p>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading…</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {ROLE_LABELS[u.role] || u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(u)} className="text-gray-400 hover:text-blue-600"><Pencil size={15} /></button>
                    <button onClick={() => { setResetUser(u); setNewPassword('') }} className="text-gray-400 hover:text-yellow-600"><KeyRound size={15} /></button>
                    <button onClick={() => handleToggle(u)} className={`${u.is_active ? 'text-green-500 hover:text-red-500' : 'text-gray-400 hover:text-green-500'}`}>
                      {u.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit user modal */}
      {showForm && (
        <Modal title={editing ? 'Edit User' : 'Add User'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            {[
              { label: 'Name *', field: 'name', required: true },
              { label: 'Email *', field: 'email', type: 'email', required: true },
              { label: 'Phone', field: 'phone' },
            ].map(({ label, field, type = 'text', required }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type={type} value={form[field] || ''} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  required={required}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {errors[field] && <p className="text-xs text-red-600 mt-1">{errors[field][0]}</p>}
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            {!editing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password[0]}</p>}
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Saving…' : editing ? 'Update' : 'Create User'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset password modal */}
      {resetUser && (
        <Modal title={`Reset Password — ${resetUser.name}`} onClose={() => setResetUser(null)}>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={saving}
                className="bg-yellow-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-60">
                {saving ? 'Saving…' : 'Reset Password'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
