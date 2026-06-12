import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/ui/Modal'
import LoanProductForm from './LoanProductForm'

export default function LoanProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/loan-products')
      setProducts(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id) {
    if (!confirm('Delete this loan product?')) return
    try {
      await api.delete(`/loan-products/${id}`)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete.')
    }
  }

  function handleEdit(product) {
    setEditing(product)
    setShowForm(true)
  }

  function handleClose() {
    setShowForm(false)
    setEditing(null)
  }

  const methodLabel = { flat_rate: 'Flat Rate', reducing_balance: 'Reducing Balance' }
  const freqLabel = { daily: 'Daily', weekly: 'Weekly', biweekly: 'Bi-weekly', monthly: 'Monthly', quarterly: 'Quarterly' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Loan Products</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> New Product
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
          No loan products yet. Create one to get started.
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800">{p.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {p.description && <p className="text-sm text-gray-500 mb-3">{p.description}</p>}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span><span className="font-medium">Interest:</span> {p.interest_rate}% ({methodLabel[p.interest_method]})</span>
                    <span><span className="font-medium">Frequency:</span> {freqLabel[p.repayment_frequency]}</span>
                    <span><span className="font-medium">Term:</span> {p.min_term}–{p.max_term || '∞'} {p.term_unit}</span>
                    <span><span className="font-medium">Amount:</span> K{Number(p.min_amount).toLocaleString()}–{p.max_amount ? 'K' + Number(p.max_amount).toLocaleString() : '∞'}</span>
                    <span><span className="font-medium">Grace:</span> {p.grace_period_days} days</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => handleEdit(p)} className="text-gray-400 hover:text-blue-600"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Loan Product' : 'New Loan Product'} onClose={handleClose}>
          <LoanProductForm product={editing} onSuccess={() => { handleClose(); load() }} />
        </Modal>
      )}
    </div>
  )
}
