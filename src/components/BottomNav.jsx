import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Wallet, CheckSquare, TrendingUp, BarChart2,
  Lock, X, Zap, ArrowRight, CalendarClock,
} from 'lucide-react';
import { playSound } from '@/lib/sound';
import { getTaskFlow } from '@/lib/taskFlowStore';

const SIDE_ITEMS = [
  { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { icon: Wallet, label: 'Wallet', path: '/dashboard/wallet' },
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
        className="w-full max-w-sm rounded-3xl overflow-hidden bg-card border border-border"
      >
        {/* Gradient header */}
        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-6 pt-7 pb-12">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Lock size={26} className="text-white" />
          </div>
          <p className="text-center font-black text-xl text-white tracking-tight">Unlock Sales Trading</p>
          <p className="text-center text-white/75 text-sm mt-1">The advanced earning program</p>
        </div>

        <div className="-mt-6 rounded-t-3xl bg-card px-5 pt-6 pb-7 space-y-4">
          {/* Earnings teaser */}
          <div className="rounded-2xl bg-violet-500/10 border border-violet-500/20 p-4 text-center">
            <p className="text-[10px] text-violet-400 font-bold uppercase tracking-widest mb-1">Sales Traders earn</p>
            <p className="text-3xl font-black text-violet-400">+UGX 150,000+</p>
            <p className="text-[11px] text-muted-foreground mt-1">per bond sold — multiple bonds every single day</p>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            {[
              { icon: Zap, text: 'Sell government bonds to real buyers — earn UGX 150,000 to UGX 33,000,000 profit per sale' },
              { icon: TrendingUp, text: 'Higher VIP level = more bonds to sell daily = much bigger earnings' },
              { icon: CalendarClock, text: 'Monthly contracts — bigger commitment, much bigger rewards. Withdraw after 30 days.' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={13} className="text-violet-400" />
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{text}</p>
              </div>
            ))}
          </div>

          {/* Requirement */}
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4">
            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-2">To unlock Sales Trading</p>
            <p className="text-sm text-foreground font-medium">Make a first deposit of</p>
            <p className="text-2xl font-black text-amber-400 mt-0.5">UGX 250,000</p>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              This is a 30-day trading contract. Your capital works for you the whole month.
            </p>
          </div>

          {/* CTAs */}
          <button
            onClick={() => { onClose(); navigate('/dashboard/deposit'); playSound('click'); }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2"
          >
            Recharge UGX 250,000 <ArrowRight size={15} />
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl border border-border text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
          >
            Not now — continue with Daily Earnings
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function BottomNav() {
  const location = useLocation();
  const [gateOpen, setGateOpen] = useState(false);
  const taskFlow = getTaskFlow();
  const isSales = taskFlow === 'sales';

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

          {/* Center button — Invest (daily) or Tasks (sales) */}
          {isSales ? (
            <Link
              to="/dashboard/tasks"
              onClick={() => playSound('click')}
              className="flex flex-col items-center justify-center -mt-6"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/40 bg-gradient-to-br from-violet-500 to-purple-600 ${
                  location.pathname.startsWith('/dashboard/tasks') ? 'ring-4 ring-violet-500/30' : ''
                }`}
              >
                <CheckSquare size={24} className="text-white" />
              </motion.div>
              <span className="text-[10px] font-medium text-violet-400 mt-1">Tasks</span>
            </Link>
          ) : (
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
          )}

          {/* Locked Tasks button (daily mode) or Invest button (sales mode) */}
          {isSales ? (
            <Link
              to="/dashboard/invest"
              onClick={() => playSound('click')}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors ${
                location.pathname === '/dashboard/invest' ? 'text-emerald-500' : 'text-muted-foreground'
              }`}
            >
              <BarChart2 size={20} />
              <span className="text-[10px] font-medium">Buy</span>
            </Link>
          ) : (
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
          )}

          {/* Portfolio always right */}
          {renderLink({ icon: TrendingUp, label: 'Portfolio', path: '/dashboard/portfolio' })}
        </div>
      </nav>

      <AnimatePresence>
        {gateOpen && <TasksGateModal onClose={() => setGateOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
