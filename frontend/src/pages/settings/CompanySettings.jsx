import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function CompanySettings() {
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/settings/company').then(r => setForm(r.data))
  }, [])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: null }))
    setSaved(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      await api.put('/settings/company', form)
      setSaved(true)
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
    } finally {
      setSaving(false)
    }
  }

  if (!form) return <p className="text-gray-400 text-sm">Loading…</p>

  return (
    <div className="max-w-xl">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {[
          { label: 'Company Name *', field: 'name', required: true },
          { label: 'Phone', field: 'phone' },
          { label: 'Email', field: 'email', type: 'email' },
          { label: 'Address', field: 'address' },
          { label: 'City', field: 'city' },
        ].map(({ label, field, type = 'text', required }) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input type={type} value={form[field] || ''} onChange={e => set(field, e.target.value)}
              required={required}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors[field] && <p className="text-xs text-red-600 mt-1">{errors[field][0]}</p>}
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color</label>
          <div className="flex items-center gap-3">
            <input type="color" value={form.primary_color || '#2563eb'}
              onChange={e => set('primary_color', e.target.value)}
              className="h-9 w-16 rounded border border-gray-300 cursor-pointer" />
            <span className="text-sm text-gray-500">{form.primary_color}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saved && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </form>
    </div>
  )
}
