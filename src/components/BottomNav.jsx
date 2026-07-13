import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Wallet, CheckSquare, TrendingUp, Store } from 'lucide-react';
import { playSound } from '@/lib/sound';

const SIDE_ITEMS = [
  { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { icon: Wallet, label: 'Wallet', path: '/dashboard/wallet' },
];

const SIDE_ITEMS_RIGHT = [
  { icon: Store, label: 'Market', path: '/dashboard/marketplace' },
  { icon: TrendingUp, label: 'Portfolio', path: '/dashboard/portfolio' },
];

export default function BottomNav() {
  const location = useLocation();

  const renderLink = (item) => {
    const active = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => playSound('click')}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors ${
          active ? 'text-emerald-500' : 'text-muted-foreground'
        }`}
      >
        <item.icon size={20} />
        <span className="text-[10px] font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 glass-strong border-t border-border">
      <div className="flex items-end justify-around max-w-md mx-auto px-2">
        {SIDE_ITEMS.map(renderLink)}

        {/* Center Tasks button */}
        <Link
          to="/dashboard/tasks"
          onClick={() => playSound('click')}
          className="flex flex-col items-center justify-center -mt-6"
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/40 bg-gradient-to-br from-emerald-500 to-teal-600 ${
              location.pathname === '/dashboard/tasks' ? 'ring-4 ring-emerald-500/30' : ''
            }`}
          >
            <CheckSquare size={24} className="text-white" />
          </motion.div>
          <span className="text-[10px] font-medium text-emerald-500 mt-1">Tasks</span>
        </Link>

        {SIDE_ITEMS_RIGHT.map(renderLink)}
      </div>
    </nav>
  );
}