import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  LayoutDashboard, Users, FileText, CreditCard,
  BarChart2, Settings, Package, LogOut,
  PiggyBank, Receipt, UsersRound, Coins, TrendingUp, Landmark, Vote,
  Inbox, Newspaper, UserCog, ArrowDownCircle, Heart, ClipboardCheck,
} from 'lucide-react'
import { logout } from '../../store/slices/authSlice'

const NAV = [
  { section: 'Overview' },
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard' },
  { section: 'Members' },
  { to: '/borrowers',     icon: Users,           label: 'Members',       perm: 'members' },
  { to: '/contributions', icon: Coins,           label: 'Contributions', perm: 'contributions' },
  { to: '/shares',        icon: Landmark,        label: 'Share Capital', perm: 'shares' },
  { to: '/groups',        icon: UsersRound,      label: 'Groups',        perm: 'groups' },
  { section: 'Finance' },
  { to: '/savings',              icon: PiggyBank,       label: 'Savings',           perm: 'savings' },
  { to: '/withdrawal-requests',  icon: ArrowDownCircle, label: 'Withdrawals',       perm: 'savings' },
  { to: '/loans',                icon: FileText,        label: 'Loans',             perm: 'loans' },
  { to: '/repayments',           icon: CreditCard,      label: 'Repayments',        perm: 'repayments' },
  { to: '/dividends',            icon: TrendingUp,      label: 'Dividends',         perm: 'dividends' },
  { to: '/expenses',             icon: Receipt,         label: 'Expenses',          perm: 'expenses' },
  { to: '/welfare',              icon: Heart,           label: 'Welfare Fund',      perm: 'expenses' },
  { to: '/savings-compliance',   icon: ClipboardCheck,  label: 'Savings Compliance',perm: 'members' },
  { section: 'Communications' },
  { to: '/inbox',         icon: Inbox,           label: 'Inbox',         perm: 'inbox' },
  { to: '/news',          icon: Newspaper,       label: 'News',          perm: 'news' },
  { section: 'System' },
  { to: '/governance',    icon: Vote,            label: 'Governance',    perm: 'governance' },
  { to: '/loan-products', icon: Package,         label: 'Loan Products', adminOnly: true },
  { to: '/reports',       icon: BarChart2,       label: 'Reports',       perm: 'reports' },
  { to: '/settings',      icon: Settings,        label: 'Settings',  adminOnly: true },
]

function canSee(item, user) {
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  if (item.adminOnly) return isAdmin
  if (!item.perm) return true
  if (isAdmin) return true
  return !!user?.permissions?.[item.perm]
}

export default function Sidebar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const isAdmin  = user?.role === 'admin' || user?.role === 'super_admin'

  async function handleLogout() {
    await dispatch(logout())
    navigate('/login')
  }

  // Build visible nav — drop section headers that have no visible items below them
  const visible = []
  let pendingSection = null
  for (const item of NAV) {
    if (item.section) {
      pendingSection = item
    } else if (canSee(item, user)) {
      if (pendingSection) { visible.push(pendingSection); pendingSection = null }
      visible.push(item)
    }
  }

  return (
    <aside className="w-64 bg-slate-900 flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div>
          <span className="text-xl font-bold text-emerald-400 tracking-tight">Sycamore</span>
          <span className="block text-xs text-slate-500 -mt-0.5">SACCO Platform</span>
        </div>
        {isAdmin && (
          <span className="ml-auto text-xs bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded-full">Admin</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-0.5">
        {visible.map((item, i) => {
          if (item.section) {
            return (
              <p key={i} className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 pt-5 pb-1 first:pt-2">
                {item.section}
              </p>
            )
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          )
        })}

        {/* Staff management — admin only */}
        {isAdmin && (
          <NavLink to="/staff"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all mt-1 ${
                isActive ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <UserCog size={17} /> Staff &amp; Access
          </NavLink>
        )}
      </nav>

      {/* User */}
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
            <p className="text-xs text-slate-500 capitalize truncate">{user?.role?.replace('_', ' ')}</p>
          </div>
        </NavLink>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-all">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  )
}
