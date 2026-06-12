import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/ui/Modal'

const EMPTY = {
  name: '', phone: '', national_id: '', relationship: '',
  address: '', employer: '', monthly_income: '', borrower_id: '',
}

export default function GuarantorsPanel({ loanId }) {
  const [items, setItems]     = useState([])
  const [borrowers, setBorrowers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY)
  const [errors, setErrors]   = useState({})
  const [saving, setSaving]   = useState(false)

  async function load() {
    const { data } = await api.get(`/loans/${loanId}/guarantors`)
    setItems(data)
  }

  useEffect(() => {
    load()
    api.get('/borrowers', { params: { page: 1 } }).then(r => setBorrowers(r.data.data))
  }, [loanId])

  function openAdd()    { setForm(EMPTY); setEditing(null); setErrors({}); setShowForm(true) }
  function openEdit(g)  { setForm({ ...g, borrower_id: g.borrower_id || '' }); setEditing(g); setErrors({}); setShowForm(true) }

  // When selecting an existing borrower, auto-fill fields
  function handleBorrowerSelect(borrowerId) {
    const b = borrowers.find(b => b.id === Number(borrowerId))
    if (b) {
      setForm(f => ({
        ...f,
        borrower_id: borrowerId,
        name:        `${b.first_name} ${b.last_name}`,
        phone:       b.phone,
        national_id: b.national_id || '',
        address:     b.address || '',
        employer:    b.employer || '',
        monthly_income: b.monthly_income || '',
      }))
    } else {
      setForm(f => ({ ...f, borrower_id: '' }))
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true); setErrors({})
    try {
      if (editing) await api.put(`/loans/${loanId}/guarantors/${editing.id}`, form)
      else         await api.post(`/loans/${loanId}/guarantors`, form)
      setShowForm(false); load()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this guarantor?')) return
    await api.delete(`/loans/${loanId}/guarantors/${id}`)
    load()
  }

  function set(f, v) { setForm(p => ({ ...p, [f]: v })); setErrors(e => ({ ...e, [f]: null })) }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-800">Guarantors ({items.length})</h2>
        <button onClick={openAdd}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
          <Plus size={14} /> Add
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No guarantors added.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map(g => (
            <div key={g.id} className="px-4 py-3 flex items-start justify-between">
              <div className="text-sm">
                <p className="font-medium text-gray-800">{g.name}</p>
                <p className="text-gray-500 text-xs">{g.phone}{g.relationship ? ` · ${g.relationship}` : ''}</p>
                {g.national_id && <p className="text-gray-400 text-xs">ID: {g.national_id}</p>}
              </div>
              <div className="flex gap-2 ml-4 shrink-0">
                <button onClick={() => openEdit(g)} className="text-gray-400 hover:text-blue-600"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(g.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Guarantor' : 'Add Guarantor'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Existing Borrower (optional)</label>
              <select value={form.borrower_id} onChange={e => handleBorrowerSelect(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— External guarantor —</option>
                {borrowers.map(b => (
                  <option key={b.id} value={b.id}>{b.first_name} {b.last_name} ({b.borrower_no})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Full Name *', field: 'name', required: true },
                { label: 'Phone *',     field: 'phone', required: true },
                { label: 'National ID', field: 'national_id' },
                { label: 'Relationship', field: 'relationship' },
                { label: 'Address',     field: 'address' },
                { label: 'Employer',    field: 'employer' },
              ].map(({ label, field, required }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                  <input type="text" value={form[field] || ''} onChange={e => set(field, e.target.value)} required={required}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {errors[field] && <p className="text-xs text-red-600 mt-1">{errors[field][0]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Monthly Income</label>
                <input type="number" value={form.monthly_income || ''} onChange={e => set('monthly_income', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Saving…' : editing ? 'Update' : 'Add Guarantor'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
