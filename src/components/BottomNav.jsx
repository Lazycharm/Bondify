import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Wallet, CheckSquare, TrendingUp, BarChart2,
  Lock, X, Zap, ArrowRight,
} from 'lucide-react';
import { playSound } from '@/lib/sound';

const SIDE_ITEMS = [
  { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { icon: Wallet, label: 'Wallet', path: '/dashboard/wallet' },
];

const SIDE_ITEMS_RIGHT = [
  { icon: TrendingUp, label: 'Portfolio', path: '/dashboard/portfolio' },
];

function TasksGateModal({ onClose }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 pb-6 bg-navy/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ background: 'var(--card)' }}
      >
        {/* Gradient header */}
        <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 px-6 pt-7 pb-12">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Lock size={26} className="text-white" />
          </div>
          <p className="text-center font-black text-xl text-white tracking-tight">Unlock Daily Tasks</p>
          <p className="text-center text-white/75 text-sm mt-1">and supercharge your earnings</p>
        </div>

        {/* Pull-up content */}
        <div className="-mt-6 rounded-t-3xl bg-card px-5 pt-6 pb-7 space-y-4 border-t border-border">
          {/* Earnings teaser */}
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">You could be earning right now</p>
            <p className="text-3xl font-black text-emerald-400">+UGX 4,000</p>
            <p className="text-[11px] text-muted-foreground mt-1">per day, every day — on top of your bonds</p>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            {[
              { icon: Zap, text: 'Complete simple daily tasks to earn guaranteed UGX income — no risk, no guesswork' },
              { icon: TrendingUp, text: 'Higher VIP level = bigger task rewards. Reach VIP 10 for up to UGX 33,000/day' },
              { icon: ArrowRight, text: 'Stack task income on top of bond returns for maximum daily compounding' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={13} className="text-emerald-400" />
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{text}</p>
              </div>
            ))}
          </div>

          {/* Requirement pill */}
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4">
            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-2">To unlock tasks</p>
            <p className="text-sm text-foreground font-medium">Maintain a minimum wallet balance of</p>
            <p className="text-2xl font-black text-amber-400 mt-0.5">UGX 20,000</p>
            <p className="text-[11px] text-muted-foreground mt-1.5">One-time threshold — stay above it and tasks stay active forever.</p>
          </div>

          {/* CTAs */}
          <button
            onClick={() => { onClose(); navigate('/dashboard/invest'); playSound('click'); }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
          >
            Buy a Bond Package <ArrowRight size={15} />
          </button>
          <button
            onClick={() => { onClose(); navigate('/dashboard/deposit'); playSound('click'); }}
            className="w-full py-3 rounded-2xl border border-border text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
          >
            Deposit Funds Instead
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function BottomNav() {
  const location = useLocation();
  const [gateOpen, setGateOpen] = useState(false);

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
    <>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 glass-strong border-t border-border">
        <div className="flex items-end justify-around max-w-md mx-auto px-2">
          {SIDE_ITEMS.map(renderLink)}

          {/* Center — Invest (primary action) */}
          <Link
            to="/dashboard/invest"
            onClick={() => playSound('click')}
            className="flex flex-col items-center justify-center -mt-6"
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/40 bg-gradient-to-br from-emerald-500 to-teal-600 ${
                location.pathname === '/dashboard/invest' ? 'ring-4 ring-emerald-500/30' : ''
              }`}
            >
              <BarChart2 size={24} className="text-white" />
            </motion.div>
            <span className="text-[10px] font-medium text-emerald-500 mt-1">Invest</span>
          </Link>

          {/* Locked Tasks button */}
          <button
            onClick={() => { playSound('click'); setGateOpen(true); }}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors relative"
          >
            <div className="relative">
              <CheckSquare size={20} className="text-muted-foreground opacity-50" />
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
                <Lock size={8} className="text-white" />
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-400">Earn More</span>
          </button>

          {SIDE_ITEMS_RIGHT.map(renderLink)}
        </div>
      </nav>

      <AnimatePresence>
        {gateOpen && <TasksGateModal onClose={() => setGateOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
