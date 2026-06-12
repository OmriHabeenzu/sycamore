import { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Camera, Loader, CheckCircle, Eye, EyeOff } from 'lucide-react'
import api from '../../api/axios'
import { fetchMe } from '../../store/slices/authSlice'

export default function Profile() {
  const dispatch      = useDispatch()
  const { user }      = useSelector(s => s.auth)
  const fileRef       = useRef(null)

  const [form, setForm]         = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [savingInfo, setSavingInfo] = useState(false)
  const [savedInfo, setSavedInfo]   = useState(false)

  const [pwForm, setPwForm]     = useState({ current_password: '', new_password: '', new_password_confirmation: '' })
  const [savingPw, setSavingPw] = useState(false)
  const [pwMsg, setPwMsg]       = useState(null)   // { type: 'success'|'error', text }
  const [showPw, setShowPw]     = useState(false)

  const [uploading, setUploading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(
    user?.photo ? `/lms/lms/public/storage/${user.photo}` : null
  )

  const photoUrl = photoPreview || null

  const handleInfoSave = async (e) => {
    e.preventDefault()
    setSavingInfo(true)
    try {
      await api.put('/profile', form)
      await dispatch(fetchMe())
      setSavedInfo(true)
      setTimeout(() => setSavedInfo(false), 2000)
    } finally {
      setSavingInfo(false)
    }
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('photo', file)
      await api.post('/profile/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      await dispatch(fetchMe())
    } finally {
      setUploading(false)
    }
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    setSavingPw(true)
    setPwMsg(null)
    try {
      await api.post('/profile/change-password', pwForm)
      setPwMsg({ type: 'success', text: 'Password changed successfully.' })
      setPwForm({ current_password: '', new_password: '', new_password_confirmation: '' })
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' })
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Photo */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Profile Photo</h2>
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20">
            <div className="w-20 h-20 rounded-full bg-emerald-100 overflow-hidden flex items-center justify-center">
              {photoUrl
                ? <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                : <span className="text-2xl font-bold text-emerald-700">{user?.name?.charAt(0)?.toUpperCase()}</span>
              }
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                <Loader className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>
          <div>
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
              <Camera className="w-4 h-4" /> Change Photo
            </button>
            <p className="text-xs text-gray-400 mt-1.5">JPG or PNG, max 2MB</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Personal Information</h2>
        <form onSubmit={handleInfoSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input value={user?.email || ''} disabled
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed. Contact admin if needed.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingInfo}
              className="flex items-center gap-2 bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50">
              {savedInfo
                ? <><CheckCircle className="w-4 h-4" /> Saved</>
                : savingInfo ? <Loader className="w-4 h-4 animate-spin" /> : 'Save Changes'
              }
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Current Password *</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={pwForm.current_password}
                onChange={e => setPwForm(p => ({ ...p, current_password: e.target.value }))} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">New Password *</label>
            <input type={showPw ? 'text' : 'password'} value={pwForm.new_password}
              onChange={e => setPwForm(p => ({ ...p, new_password: e.target.value }))} required minLength={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password *</label>
            <input type={showPw ? 'text' : 'password'} value={pwForm.new_password_confirmation}
              onChange={e => setPwForm(p => ({ ...p, new_password_confirmation: e.target.value }))} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>

          {pwMsg && (
            <div className={`text-sm px-4 py-3 rounded-lg ${pwMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {pwMsg.text}
            </div>
          )}

          <div className="flex justify-end">
            <button type="submit" disabled={savingPw || !pwForm.current_password || !pwForm.new_password}
              className="flex items-center gap-2 bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50">
              {savingPw ? <Loader className="w-4 h-4 animate-spin" /> : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
