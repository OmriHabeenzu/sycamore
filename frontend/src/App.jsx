import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import MemberLayout from './layouts/MemberLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/auth/Login'
import Dashboard from './pages/Dashboard'
import Borrowers from './pages/borrowers/Borrowers'
import BorrowerDetail from './pages/borrowers/BorrowerDetail'
import LoanProducts from './pages/loan-products/LoanProducts'
import Loans from './pages/loans/Loans'
import LoanDetail from './pages/loans/LoanDetail'
import Repayments from './pages/repayments/Repayments'
import Savings from './pages/savings/Savings'
import SavingsDetail from './pages/savings/SavingsDetail'
import Expenses from './pages/expenses/Expenses'
import Groups from './pages/groups/Groups'
import GroupDetail from './pages/groups/GroupDetail'
import LoanStatement from './pages/loans/LoanStatement'
import RepaymentReceipt from './pages/loans/RepaymentReceipt'
import BorrowerStatement from './pages/borrowers/BorrowerStatement'
import Contributions from './pages/contributions/Contributions'
import Dividends from './pages/dividends/Dividends'
import Shares from './pages/shares/Shares'
import Governance from './pages/governance/Governance'
import Reports from './pages/reports/Reports'
import Settings from './pages/settings/Settings'
import Inbox from './pages/inbox/Inbox'
import NewsManagement from './pages/news/NewsManagement'
import StaffManagement from './pages/staff/StaffManagement'
import WithdrawalRequests from './pages/withdrawals/WithdrawalRequests'
import Welfare from './pages/welfare/Welfare'
import SavingsCompliance from './pages/borrowers/SavingsCompliance'
import MemberDashboard from './pages/member/MemberDashboard'
import MemberLoans from './pages/member/MemberLoans'
import MemberSavings from './pages/member/MemberSavings'
import MemberContributions from './pages/member/MemberContributions'
import MemberShares from './pages/member/MemberShares'
import Profile from './pages/profile/Profile'

function RootRedirect() {
  const { user } = useSelector(s => s.auth)
  if (user?.role === 'member') return <Navigate to="/my" replace />
  return <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected — print views (no layout) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/loans/:id/statement"       element={<LoanStatement />} />
          <Route path="/repayments/:id/receipt"    element={<RepaymentReceipt />} />
          <Route path="/borrowers/:id/statement"   element={<BorrowerStatement />} />
        </Route>

        {/* Member portal */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MemberLayout />}>
            <Route path="/my"                  element={<MemberDashboard />} />
            <Route path="/my/loans"            element={<MemberLoans />} />
            <Route path="/my/savings"          element={<MemberSavings />} />
            <Route path="/my/contributions"    element={<MemberContributions />} />
            <Route path="/my/shares"           element={<MemberShares />} />
            <Route path="/profile"             element={<Profile />} />
          </Route>
        </Route>

        {/* Staff / Admin dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/"                  element={<Dashboard />} />
            <Route path="/borrowers"         element={<Borrowers />} />
            <Route path="/borrowers/:id"     element={<BorrowerDetail />} />
            <Route path="/loan-products"     element={<LoanProducts />} />
            <Route path="/loans"             element={<Loans />} />
            <Route path="/loans/:id"         element={<LoanDetail />} />
            <Route path="/repayments"        element={<Repayments />} />
            <Route path="/savings"           element={<Savings />} />
            <Route path="/savings/:id"       element={<SavingsDetail />} />
            <Route path="/expenses"          element={<Expenses />} />
            <Route path="/groups"            element={<Groups />} />
            <Route path="/groups/:id"        element={<GroupDetail />} />
            <Route path="/contributions"     element={<Contributions />} />
            <Route path="/dividends"         element={<Dividends />} />
            <Route path="/shares"            element={<Shares />} />
            <Route path="/governance"        element={<Governance />} />
            <Route path="/reports"           element={<Reports />} />
            <Route path="/settings"          element={<Settings />} />
            <Route path="/inbox"             element={<Inbox />} />
            <Route path="/news"              element={<NewsManagement />} />
            <Route path="/staff"                element={<StaffManagement />} />
            <Route path="/withdrawal-requests" element={<WithdrawalRequests />} />
            <Route path="/welfare"             element={<Welfare />} />
            <Route path="/savings-compliance"  element={<SavingsCompliance />} />
            <Route path="/profile"             element={<Profile />} />
          </Route>
        </Route>

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
