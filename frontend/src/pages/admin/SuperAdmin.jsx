import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Plus, ToggleLeft, ToggleRight, Building2 } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/ui/Modal'

const STATUS_COLORS = {
  active:    'bg-green-100 text-green-700',
  suspended: 'bg-red-100 text-red-600',
  trial:     'bg-yellow-100 text-yellow-700',
}
const PLAN_COLORS = {
  basic:      'bg-gray-100 text-gray-600',
  pro:        'bg-blue-100 text-blue-600',
  enterprise: 'bg-purple-100 text-purple-600',
}

const EMPTY_FORM = {
  name: '', email: '', phone: '', country: 'Zambia',
  subscription_plan: 'basic',
  admin_name: '', admin_email: '', admin_password: '',
}

export default function SuperAdmin() {
  const { user } = useSelector(s => s.auth)
  const navigate = useNavigate()

  const [overview, setOverview] = useState(null)
  const [tenants, setTenants]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [errors, setErrors]     = useState({})
  const [saving, setSaving]     = useState(false)

  // Guard — non super-admins shouldn't see this
  useEffect(() => {
    if (user && user.role !== 'super_admin') navigate('/')
  }, [user])

  async function load() {
    setLoading(true)
    try {
      const [ov, ten] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/tenants'),
      ])
      setOverview(ov.data)
      setTenants(ten.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleToggle(tenant) {
    if (tenant.status === 'active') {
      if (!confirm(`Suspend ${tenant.name}?`)) return
      await api.post(`/admin/tenants/${tenant.id}/suspend`)
    } else {
      await api.post(`/admin/tenants/${tenant.id}/activate`)
    }
    load()
  }

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true); setErrors({})
    try {
      await api.post('/admin/tenants', form)
      setShowForm(false); setForm(EMPTY_FORM); load()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
    } finally { setSaving(false) }
  }

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: null }))
  }

  if (loading) return <div className="text-gray-400 text-sm py-10 text-center">Loading…</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Super Admin — Tenant Management</h1>

      {/* Overview stats */}
      {overview && (
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Tenants',   value: overview.total_tenants },
            { label: 'Active',          value: overview.active_tenants },
            { label: 'Suspended',       value: overview.suspended, red: overview.suspended > 0 },
            { label: 'Total Loans',     value: overview.total_loans },
            { label: 'Total Members', value: overview.total_borrowers },
            { label: 'Total Collected', value: `K${Number(overview.total_collected).toLocaleString()}` },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.red ? 'text-red-600' : 'text-gray-800'}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tenants table */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">Tenants</h2>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Onboard Tenant
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Company</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Plan</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Members</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Loans</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Users</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tenants.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">No tenants yet.</td></tr>
            ) : tenants.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-800">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${PLAN_COLORS[t.subscription_plan]}`}>
                    {t.subscription_plan}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">{t.borrowers_count}</td>
                <td className="px-4 py-3 text-right">{t.loans_count}</td>
                <td className="px-4 py-3 text-right">{t.users_count}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[t.status]}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{t.created_at?.split('T')[0]}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggle(t)}
                    className={`${t.status === 'active' ? 'text-green-500 hover:text-red-500' : 'text-gray-400 hover:text-green-500'}`}>
                    {t.status === 'active' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title="Onboard New Tenant" onClose={() => setShowForm(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Company Details</p>
            {[
              { label: 'Company Name *', field: 'name', required: true },
              { label: 'Email', field: 'email', type: 'email' },
              { label: 'Phone', field: 'phone' },
              { label: 'Country', field: 'country' },
            ].map(({ label, field, type = 'text', required }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type={type} value={form[field]} onChange={e => set(field, e.target.value)} required={required}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {errors[field] && <p className="text-xs text-red-600 mt-1">{errors[field][0]}</p>}
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
              <select value={form.subscription_plan} onChange={e => set('subscription_plan', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <hr className="border-gray-200" />
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Admin User for this Tenant</p>

            {[
              { label: 'Admin Name *', field: 'admin_name', required: true },
              { label: 'Admin Email *', field: 'admin_email', type: 'email', required: true },
              { label: 'Admin Password *', field: 'admin_password', type: 'password', required: true },
            ].map(({ label, field, type = 'text', required }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type={type} value={form[field]} onChange={e => set(field, e.target.value)} required={required}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {errors[field] && <p className="text-xs text-red-600 mt-1">{errors[field][0]}</p>}
              </div>
            ))}

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Creating…' : 'Create Tenant'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
