import { useEffect, useState } from 'react'
import { Loader, Landmark } from 'lucide-react'
import api from '../../api/axios'

export default function MemberShares() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/my/shares')
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false))
  }, [])

  const fmt = n => `K${Number(n || 0).toLocaleString()}`

  if (loading) return <div className="flex justify-center py-20"><Loader className="w-7 h-7 animate-spin text-emerald-500" /></div>

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Shares</h1>

      {!data ? (
        <div className="text-center py-20 text-gray-400">No share capital recorded yet.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Landmark size={24} className="text-emerald-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-700">{Number(data.shares || 0).toLocaleString()}</div>
              <div className="text-sm text-gray-400">Shares held</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Amount per Share</div>
              <div className="font-semibold text-gray-900">{fmt(data.amount_per_share)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Total Share Value</div>
              <div className="font-semibold text-gray-900">
                {fmt((data.shares || 0) * (data.amount_per_share || 0))}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Status</div>
              <div className="font-semibold capitalize text-gray-900">{data.status || '—'}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Since</div>
              <div className="font-semibold text-gray-900">
                {data.created_at ? new Date(data.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '—'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
