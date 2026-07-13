import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Wallet, TrendingUp, Gift, CheckSquare,
  Crown, Users, Trophy, LifeBuoy, Sun, Moon, Volume2, VolumeX,
  Bell, Menu, LogOut, Store, ArrowUpRight, User, Calculator,
} from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { isMuted, setMuted, playSound } from '@/lib/sound';
import BottomNav from '@/components/BottomNav';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Store, label: 'Marketplace', path: '/dashboard/marketplace' },
  { icon: Wallet, label: 'Wallet', path: '/dashboard/wallet' },
  { icon: ArrowUpRight, label: 'Withdrawals', path: '/dashboard/withdrawals' },
  { icon: TrendingUp, label: 'Portfolio', path: '/dashboard/portfolio' },
  { icon: Calculator, label: 'Calculator', path: '/dashboard/calculator' },
  { icon: CheckSquare, label: 'Tasks', path: '/dashboard/tasks' },
  { icon: Crown, label: 'VIP Levels', path: '/dashboard/vip' },
  { icon: Gift, label: 'Daily Gift', path: '/dashboard/gift' },
  { icon: Users, label: 'Referrals', path: '/dashboard/referrals' },
  { icon: Trophy, label: 'Achievements', path: '/dashboard/achievements' },
  { icon: User, label: 'Profile', path: '/dashboard/profile' },
  { icon: LifeBuoy, label: 'Support', path: '/dashboard/support' },
];

export default function Layout() {
  const { theme, toggle } = useTheme();
  const { logout, user } = useAuth();
  const [muted, setMutedState] = useState(isMuted());
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const userInitial = (user?.email?.[0] ?? user?.user_metadata?.full_name?.[0] ?? 'U').toUpperCase();
  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Welcome back';

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) playSound('click');
  };

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <Link to="/" className="flex items-center gap-2 px-2 py-1 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/30">
          T
        </div>
        <span className="font-bold tracking-tight">
          Treasury<span className="text-emerald-500">Bonds</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => { playSound('click'); setMobileOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                active ? 'text-emerald-500' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon size={18} className="relative z-10" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl glass text-sm text-foreground">
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button onClick={() => { toggle(); playSound('click'); }} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl glass text-sm text-foreground">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        <button
          onClick={() => { playSound('click'); logout(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar — fixed */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-card/40 backdrop-blur-xl p-4 fixed top-0 left-0 h-screen z-40">
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            className="relative w-64 bg-card p-4 h-full"
          >
            {SidebarContent}
          </motion.aside>
        </div>
      )}

      {/* Main content area — offset for fixed sidebar on desktop */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar — fixed on scroll */}
        <div className="fixed top-0 inset-x-0 lg:left-64 z-30 glass px-4 lg:px-6 py-3 flex items-center justify-between">
          {/* Left: menu (mobile) / page label (desktop) */}
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 -ml-2">
              <Menu size={20} />
            </button>
            <span className="lg:hidden font-bold">TreasuryBonds</span>
          </div>

          {/* Right: controls + account */}
          <div className="flex items-center gap-2 lg:gap-3">
            <button onClick={toggleMute} className="p-2 rounded-xl glass text-foreground">
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button onClick={() => { toggle(); playSound('click'); }} className="p-2 rounded-xl glass text-foreground">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="p-2 rounded-xl glass relative text-foreground">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
            </button>
            <Link to="/dashboard/profile" onClick={() => playSound('click')} className="flex items-center gap-2 pl-2 lg:pl-3 border-l border-border hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                {userInitial}
              </div>
              <div className="text-sm hidden sm:block">
                <p className="font-medium leading-tight">{displayName}</p>
                <p className="text-xs text-muted-foreground">{user?.email ?? ''}</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Bottom navigation — fixed (mobile only) */}
      <BottomNav />
    </div>
  );
}