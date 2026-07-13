import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Wallet, TrendingUp, Gift, CheckSquare,
  Crown, Users, Trophy, LifeBuoy, Sun, Moon, Volume2, VolumeX,
  Bell, Menu, LogOut, Store, ArrowUpRight, User, Calculator,
  Settings, CheckCheck, Info,
} from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { isMuted, setMuted, playSound } from '@/lib/sound';
import { isAdmin } from '@/lib/paymentSettings';
import { getUserNotifications, getUnreadCount, markAllRead } from '@/lib/notificationStore';
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
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const notifRef = useRef(null);
  const location = useLocation();

  const userInitial = (user?.email?.[0] ?? user?.user_metadata?.full_name?.[0] ?? 'U').toUpperCase();
  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Welcome back';
  const userIsAdmin = user?.email ? isAdmin(user.email) : false;

  useEffect(() => {
    if (!user?.id) return;
    const load = () => {
      setNotifications(getUserNotifications(user.id).slice(0, 20));
      setUnread(getUnreadCount(user.id));
    };
    load();
    const id = setInterval(load, 8000); // poll every 8s
    return () => clearInterval(id);
  }, [user?.id]);

  // Close notification panel on outside click
  useEffect(() => {
    function handler(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function openNotifications() {
    const opening = !notifOpen;
    setNotifOpen(opening);
    if (opening && user?.id) {
      markAllRead(user.id);
      setUnread(0);
      setNotifications(getUserNotifications(user.id).slice(0, 20));
    }
    playSound('click');
  }

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
          B
        </div>
        <span className="font-bold tracking-tight">
          Bondi<span className="text-emerald-500">fy</span>
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
            <span className="lg:hidden font-bold">Bondify</span>
          </div>

          {/* Right: controls + account */}
          <div className="flex items-center gap-2 lg:gap-3">
            <button onClick={toggleMute} className="p-2 rounded-xl glass text-foreground">
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button onClick={() => { toggle(); playSound('click'); }} className="p-2 rounded-xl glass text-foreground">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Admin gear icon — only for admins */}
            {userIsAdmin && (
              <Link
                to="/admin"
                onClick={() => playSound('click')}
                className="p-2 rounded-xl glass text-violet-400 hover:text-violet-300 transition-colors"
                title="Admin Panel"
              >
                <Settings size={17} />
              </Link>
            )}

            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={openNotifications}
                className="p-2 rounded-xl glass relative text-foreground"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-rose-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-80 glass border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <p className="font-semibold text-sm">Notifications</p>
                      {notifications.length > 0 && (
                        <button
                          onClick={() => { if (user?.id) { markAllRead(user.id); setUnread(0); setNotifications(getUserNotifications(user.id)); } }}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <CheckCheck size={12} /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                          <Bell size={24} className="opacity-30" />
                          <p className="text-xs">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((n) => {
                          const color = n.type === 'success' ? 'text-emerald-500' : n.type === 'error' ? 'text-rose-500' : 'text-sky-500';
                          const bg = n.type === 'success' ? 'bg-emerald-500/10' : n.type === 'error' ? 'bg-rose-500/10' : 'bg-sky-500/10';
                          return (
                            <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-border/50 last:border-0 ${!n.read ? 'bg-muted/30' : ''}`}>
                              <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                <Info size={13} className={color} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs leading-snug">{n.message}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {new Date(n.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 pb-32 lg:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Bottom navigation — fixed (mobile only) */}
      <BottomNav />
    </div>
  );
}