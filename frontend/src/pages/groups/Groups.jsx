import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Eye } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/ui/Modal'
import GroupForm from './GroupForm'

export default function Groups() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [meta, setMeta]     = useState({})
  const [page, setPage]     = useState(1)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  async function load(p = page) {
    const { data } = await api.get('/groups', { params: { page: p, search } })
    setGroups(data.data)
    setMeta(data.meta || data)
  }

  useEffect(() => { load(1); setPage(1) }, [search])
  useEffect(() => { load() }, [page])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Groups</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> New Group
        </button>
      </div>

      <div className="relative max-w-sm mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search group name or no…"
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Group No</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Officer</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Meeting</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Members</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {groups.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-sm">No groups found.</td></tr>
            )}
            {groups.map(g => (
              <tr key={g.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{g.group_no}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{g.name}</td>
                <td className="px-4 py-3 text-gray-600">{g.loan_officer?.name || '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs capitalize">
                  {g.meeting_frequency ? `${g.meeting_frequency}${g.meeting_day ? ` · ${g.meeting_day}` : ''}` : '—'}
                </td>
                <td className="px-4 py-3 text-center font-semibold text-gray-700">{g.members_count}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${g.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {g.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate(`/groups/${g.id}`)} className="text-gray-400 hover:text-blue-600">
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 rounded text-sm ${p === page ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              {p}
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title="Create Group" onClose={() => setShowForm(false)}>
          <GroupForm onSuccess={() => { setShowForm(false); load(1) }} />
        </Modal>
      )}
    </div>
  )
}
