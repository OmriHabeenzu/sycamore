import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LayoutDashboard, FileText, PiggyBank, Coins, Landmark, LogOut } from 'lucide-react'
import { logout } from '../store/slices/authSlice'


const NAV = [
  { to: '/my',            icon: LayoutDashboard, label: 'Overview',      end: true },
  { to: '/my/loans',      icon: FileText,        label: 'My Loans' },
  { to: '/my/savings',    icon: PiggyBank,       label: 'My Savings' },
  { to: '/my/contributions', icon: Coins,        label: 'Contributions' },
  { to: '/my/shares',     icon: Landmark,        label: 'Shares' },
]

export default function MemberLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)

  async function handleLogout() {
    await dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-60 bg-slate-900 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div>
            <span className="text-xl font-bold text-emerald-400 tracking-tight">Sycamore</span>
            <span className="block text-xs text-slate-500 -mt-0.5">Member Portal</span>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <item.icon size={17} /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 pb-4 border-t border-slate-800 pt-3">
          <NavLink to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-all ${isActive ? 'bg-slate-800' : 'hover:bg-slate-800'}`
            }
          >
            <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center shrink-0 overflow-hidden">
              {user?.photo
                ? <img src={`/lms/lms/public/storage/${user.photo}`} alt="" className="w-full h-full object-cover" />
                : <span className="text-xs font-bold text-emerald-200">{user?.name?.charAt(0)?.toUpperCase()}</span>
              }
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500">Member</p>
            </div>
          </NavLink>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-all">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
