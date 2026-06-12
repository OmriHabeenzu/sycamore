import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, X, Loader, CheckCircle, Copy, ToggleLeft, ToggleRight } from 'lucide-react'
import api from '../../api/axios'

const ALL_PERMS = [
  { key: 'members',       label: 'Members' },
  { key: 'contributions', label: 'Contributions' },
  { key: 'shares',        label: 'Share Capital' },
  { key: 'groups',        label: 'Groups' },
  { key: 'savings',       label: 'Savings' },
  { key: 'loans',         label: 'Loans' },
  { key: 'repayments',    label: 'Repayments' },
  { key: 'dividends',     label: 'Dividends' },
  { key: 'expenses',      label: 'Expenses' },
  { key: 'inbox',         label: 'Inbox' },
  { key: 'news',          label: 'News' },
  { key: 'governance',    label: 'Governance' },
  { key: 'reports',       label: 'Reports' },
]

const INIT_FORM = { name: '', email: '', phone: '', role: 'staff' }

export default function StaffManagement() {
  const [staff, setStaff]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(false)       // 'new' | 'perms' | null
  const [selected, setSelected]     = useState(null)
  const [form, setForm]             = useState(INIT_FORM)
  const [perms, setPerms]           = useState({})
  const [saving, setSaving]         = useState(false)
  const [newPassword, setNewPassword] = useState(null)

  useEffect(() => { fetchStaff() }, [])

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const res = await api.get('/staff')
      setStaff(res.data.data)
    } finally {
      setLoading(false)
    }
  }

  const openNew = () => { setForm(INIT_FORM); setModal('new') }

  const openPerms = (member) => {
    setSelected(member)
    setPerms(member.permissions || {})
    setModal('perms')
  }

  const handleSaveNew = async () => {
    setSaving(true)
    try {
      const res = await api.post('/staff', form)
      setStaff(prev => [...prev, res.data.user])
      setNewPassword(res.data.generated_password)
      setModal('password')
    } finally {
      setSaving(false)
    }
  }

  const handleSavePerms = async () => {
    setSaving(true)
    try {
      const res = await api.put(`/staff/${selected.id}`, { permissions: perms })
      setStaff(prev => prev.map(s => s.id === selected.id ? res.data : s))
      setModal(null)
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (member) => {
    const res = await api.put(`/staff/${member.id}`, { is_active: !member.is_active })
    setStaff(prev => prev.map(s => s.id === member.id ? res.data : s))
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this staff account?')) return
    await api.delete(`/staff/${id}`)
    setStaff(prev => prev.filter(s => s.id !== id))
  }

  const togglePerm = (key) => {
    setPerms(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const grantAll = () => {
    const all = {}
    ALL_PERMS.forEach(p => { all[p.key] = true })
    setPerms(all)
  }

  const revokeAll = () => setPerms({})

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff &amp; Access</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage staff accounts and control what each person can see</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader className="w-6 h-6 animate-spin text-green-600" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Permissions</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No staff accounts yet.</td></tr>
              )}
              {staff.map(s => {
                const permCount = Object.values(s.permissions || {}).filter(Boolean).length
                return (
                  <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                    <td className="px-4 py-3 text-gray-500">{s.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.role === 'admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        {s.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.role === 'admin' ? (
                        <span className="text-xs text-gray-400">Full access</span>
                      ) : (
                        <button onClick={() => openPerms(s)} className="text-xs text-green-700 hover:underline font-medium">
                          {permCount} / {ALL_PERMS.length} granted → Edit
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(s)} className="text-gray-400 hover:text-gray-600">
                        {s.is_active
                          ? <ToggleRight className="w-5 h-5 text-green-500" />
                          : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openPerms(s)} className="text-gray-400 hover:text-green-700"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(s.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* New staff modal */}
      {modal === 'new' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Add Staff Member</h2>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="staff">Staff (permissions required)</option>
                  <option value="admin">Admin (full access)</option>
                </select>
              </div>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button onClick={handleSaveNew} disabled={saving || !form.name || !form.email}
                className="flex items-center gap-2 bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50">
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions modal */}
      {modal === 'perms' && selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900">{selected.name}</h2>
                <p className="text-xs text-gray-400">Set what this staff member can access</p>
              </div>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="px-6 py-4">
              <div className="flex gap-3 mb-4">
                <button onClick={grantAll} className="text-xs text-green-700 hover:underline">Grant all</button>
                <span className="text-gray-300">|</span>
                <button onClick={revokeAll} className="text-xs text-red-500 hover:underline">Revoke all</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ALL_PERMS.map(p => (
                  <label key={p.key} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input type="checkbox" checked={!!perms[p.key]} onChange={() => togglePerm(p.key)}
                      className="accent-green-600 w-4 h-4" />
                    <span className="text-sm text-gray-700">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button onClick={handleSavePerms} disabled={saving}
                className="flex items-center gap-2 bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50">
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated password modal */}
      {modal === 'password' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900 mb-1">Account Created!</h2>
            <p className="text-sm text-gray-500 mb-4">Share these login credentials with the staff member.</p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-left">
              <div className="text-xs text-gray-400 mb-1">Temporary Password</div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xl font-bold text-emerald-700 tracking-widest">{newPassword}</span>
                <button onClick={() => navigator.clipboard.writeText(newPassword)} className="text-gray-400 hover:text-green-700">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">They should change this after first login.</p>
            <button onClick={() => { setModal(null); setNewPassword(null) }}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
