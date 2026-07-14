import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Download, Upload, Users,
  Menu, X, LogOut, ChevronRight, Shield, BarChart2, Share2, SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { playSound } from '@/lib/sound';
import ThemeLogo from '@/components/ThemeLogo';

const NAV = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
  { icon: Download, label: 'Deposits', path: '/admin/deposits' },
  { icon: Upload, label: 'Withdrawals', path: '/admin/withdrawals' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: BarChart2, label: 'Bonds', path: '/admin/bonds' },
  { icon: Share2, label: 'Referrals', path: '/admin/referrals' },
  { icon: SlidersHorizontal, label: 'Config', path: '/admin/config' },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const Sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-2 py-1 mb-8">
        <ThemeLogo className="h-8 w-auto object-contain mb-2" />
        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => { playSound('click'); setOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                active ? 'text-violet-400' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="admin-active"
                  className="absolute inset-0 rounded-xl bg-violet-500/10 border border-violet-500/20"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon size={18} className="relative z-10" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-border space-y-1">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        >
          <ChevronRight size={18} className="rotate-180" /> Back to App
        </Link>
        <button
          onClick={() => { playSound('click'); logout(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-card/40 backdrop-blur-xl p-4 fixed top-0 left-0 h-screen z-40">
        {Sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} className="relative w-64 bg-card p-4 h-full">
            {Sidebar}
          </motion.aside>
        </div>
      )}

      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="fixed top-0 inset-x-0 lg:left-64 z-30 glass px-4 py-3 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="lg:hidden p-2 -ml-2">
              <Menu size={20} />
            </button>
            <span className="font-semibold text-sm lg:hidden">Admin Panel</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <Shield size={14} className="text-violet-400" />
            <span className="text-xs font-medium text-violet-400">Admin Mode</span>
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
