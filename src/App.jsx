import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import { ThemeProvider } from '@/lib/ThemeContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';

import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import Dashboard from '@/pages/Dashboard';
import VipLevels from '@/pages/VipLevels';
import DailyGift from '@/pages/DailyGift';
import TaskCenter from '@/pages/TaskCenter';
import BuyerSelection from '@/pages/BuyerSelection';
import SalesContract from '@/pages/SalesContract';
import ClaimProfits from '@/pages/ClaimProfits';
import WalletPage from '@/pages/WalletPage';
import DepositPage from '@/pages/DepositPage';
import DepositGateway from '@/pages/DepositGateway';
import DepositInstructions from '@/pages/DepositInstructions';
import Portfolio from '@/pages/Portfolio';
import Referrals from '@/pages/Referrals';
import Achievements from '@/pages/Achievements';
import Support from '@/pages/Support';
import Marketplace from '@/pages/Marketplace';
import TransactionDetails from '@/pages/TransactionDetails';
import Withdrawals from '@/pages/Withdrawals';
import Profile from '@/pages/Profile';
import Calculator from '@/pages/Calculator';

import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminDeposits from '@/pages/admin/AdminDeposits';
import AdminWithdrawals from '@/pages/admin/AdminWithdrawals';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminSettings from '@/pages/admin/AdminSettings';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <ThemeProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected — user app */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/wallet" element={<WalletPage />} />
                  <Route path="/dashboard/deposit" element={<DepositPage />} />
                  <Route path="/dashboard/deposit/gateway" element={<DepositGateway />} />
                  <Route path="/dashboard/deposit/instructions" element={<DepositInstructions />} />
                  <Route path="/dashboard/portfolio" element={<Portfolio />} />
                  <Route path="/dashboard/tasks" element={<TaskCenter />} />
                  <Route path="/dashboard/tasks/sell" element={<BuyerSelection />} />
                  <Route path="/dashboard/tasks/contract" element={<SalesContract />} />
                  <Route path="/dashboard/tasks/claim" element={<ClaimProfits />} />
                  <Route path="/dashboard/vip" element={<VipLevels />} />
                  <Route path="/dashboard/gift" element={<DailyGift />} />
                  <Route path="/dashboard/referrals" element={<Referrals />} />
                  <Route path="/dashboard/achievements" element={<Achievements />} />
                  <Route path="/dashboard/support" element={<Support />} />
                  <Route path="/dashboard/marketplace" element={<Marketplace />} />
                  <Route path="/dashboard/withdrawals" element={<Withdrawals />} />
                  <Route path="/dashboard/profile" element={<Profile />} />
                  <Route path="/dashboard/calculator" element={<Calculator />} />
                  <Route path="/transaction-details/:id" element={<TransactionDetails />} />
                </Route>
              </Route>

              {/* Admin panel */}
              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/deposits" element={<AdminDeposits />} />
                  <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                </Route>
              </Route>

              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Router>
        </ThemeProvider>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
