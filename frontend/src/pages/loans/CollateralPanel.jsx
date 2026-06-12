import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/ui/Modal'

const TYPES = ['property', 'vehicle', 'equipment', 'inventory', 'other']
const EMPTY = { type: 'property', description: '', estimated_value: '', serial_number: '', location: '', notes: '' }

export default function CollateralPanel({ loanId }) {
  const [items, setItems]   = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [errors, setErrors]     = useState({})
  const [saving, setSaving]     = useState(false)

  async function load() {
    const { data } = await api.get(`/loans/${loanId}/collateral`)
    setItems(data)
  }

  useEffect(() => { load() }, [loanId])

  function openAdd()   { setForm(EMPTY); setEditing(null); setErrors({}); setShowForm(true) }
  function openEdit(c) { setForm({ ...c }); setEditing(c); setErrors({}); setShowForm(true) }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true); setErrors({})
    try {
      if (editing) await api.put(`/loans/${loanId}/collateral/${editing.id}`, form)
      else         await api.post(`/loans/${loanId}/collateral`, form)
      setShowForm(false); load()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this collateral?')) return
    await api.delete(`/loans/${loanId}/collateral/${id}`)
    load()
  }

  function set(f, v) { setForm(p => ({ ...p, [f]: v })); setErrors(e => ({ ...e, [f]: null })) }

  const totalValue = items.reduce((s, c) => s + Number(c.estimated_value), 0)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Collateral ({items.length})</h2>
          {totalValue > 0 && (
            <p className="text-xs text-gray-400">Total value: K{totalValue.toLocaleString()}</p>
          )}
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
          <Plus size={14} /> Add
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No collateral recorded.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map(c => (
            <div key={c.id} className="px-4 py-3 flex items-start justify-between">
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{c.type}</span>
                  <p className="font-medium text-gray-800">{c.description}</p>
                </div>
                <p className="text-blue-600 font-medium text-xs mt-1">K{Number(c.estimated_value).toLocaleString()}</p>
                {c.serial_number && <p className="text-gray-400 text-xs">Ref: {c.serial_number}</p>}
                {c.location && <p className="text-gray-400 text-xs">📍 {c.location}</p>}
              </div>
              <div className="flex gap-2 ml-4 shrink-0">
                <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-blue-600"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Collateral' : 'Add Collateral'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
                <select value={form.type} onChange={e => set('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Estimated Value (K) *</label>
                <input type="number" value={form.estimated_value} onChange={e => set('estimated_value', e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {errors.estimated_value && <p className="text-xs text-red-600 mt-1">{errors.estimated_value[0]}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description *</label>
              <input type="text" value={form.description} onChange={e => set('description', e.target.value)} required
                placeholder="e.g. Toyota Hilux 2019, Plot 1234 Lusaka"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description[0]}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Serial / Ref No.', field: 'serial_number', placeholder: 'Reg no., title deed, etc.' },
                { label: 'Location',         field: 'location',      placeholder: 'Where is it kept?' },
              ].map(({ label, field, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                  <input type="text" value={form[field] || ''} onChange={e => set(field, e.target.value)}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Saving…' : editing ? 'Update' : 'Add Collateral'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
