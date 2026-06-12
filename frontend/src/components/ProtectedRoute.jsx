import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { fetchMe } from '../store/slices/authSlice'

export default function ProtectedRoute() {
  const dispatch = useDispatch()
  const { isAuthenticated, initialized, token } = useSelector((s) => s.auth)

  useEffect(() => {
    if (token && !initialized) {
      dispatch(fetchMe())
    }
  }, [token, initialized, dispatch])

  // Still verifying token on first load
  if (token && !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Loading…
      </div>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
