import { useState } from 'react'
import api from '../../api/axios'

const EMPTY = {
  first_name: '', last_name: '', phone: '', email: '',
  dob: '', gender: '', national_id: '', address: '', city: '',
  employment_status: '', employer: '', monthly_income: '',
}

const INPUT = 'w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
const LABEL = 'block text-xs font-medium text-slate-700 mb-1'

export default function BorrowerForm({ onSuccess }) {
  const [form, setForm]         = useState(EMPTY)
  const [errors, setErrors]     = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving]     = useState(false)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: null }))
    setServerError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    setServerError('')
    try {
      await api.post('/borrowers', form)
      onSuccess()
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        setServerError(
          err.response?.data?.message ||
          err.message ||
          'Something went wrong. Make sure the API server is running.'
        )
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>First Name *</label>
          <input type="text" value={form.first_name} onChange={e => set('first_name', e.target.value)} required className={INPUT} />
          {errors.first_name && <p className="text-xs text-red-600 mt-1">{errors.first_name[0]}</p>}
        </div>
        <div>
          <label className={LABEL}>Last Name *</label>
          <input type="text" value={form.last_name} onChange={e => set('last_name', e.target.value)} required className={INPUT} />
          {errors.last_name && <p className="text-xs text-red-600 mt-1">{errors.last_name[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Phone *</label>
          <input type="text" value={form.phone} onChange={e => set('phone', e.target.value)} required className={INPUT} />
          {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone[0]}</p>}
        </div>
        <div>
          <label className={LABEL}>Email</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={INPUT} />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Date of Birth</label>
          <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Gender</label>
          <select value={form.gender} onChange={e => set('gender', e.target.value)} className={INPUT}>
            <option value="">— Select —</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>National ID</label>
          <input type="text" value={form.national_id} onChange={e => set('national_id', e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>City</label>
          <input type="text" value={form.city} onChange={e => set('city', e.target.value)} className={INPUT} />
        </div>
      </div>

      <div>
        <label className={LABEL}>Address</label>
        <input type="text" value={form.address} onChange={e => set('address', e.target.value)} className={INPUT} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Employment Status</label>
          <select value={form.employment_status} onChange={e => set('employment_status', e.target.value)} className={INPUT}>
            <option value="">— Select —</option>
            <option value="employed">Employed</option>
            <option value="self_employed">Self Employed</option>
            <option value="unemployed">Unemployed</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Employer</label>
          <input type="text" value={form.employer} onChange={e => set('employer', e.target.value)} className={INPUT} />
        </div>
      </div>

      <div>
        <label className={LABEL}>Monthly Income (K)</label>
        <input type="number" step="0.01" value={form.monthly_income} onChange={e => set('monthly_income', e.target.value)} className={INPUT} />
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={saving}
          className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 transition-colors">
          {saving ? 'Saving…' : 'Save Member'}
        </button>
      </div>
    </form>
  )
}
