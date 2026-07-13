import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingUp, Crown, CheckSquare, Users, Clock,
  Gift, Calendar, ArrowUpRight, Plus, Eye, EyeOff,
  ChevronRight, Sparkles,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import MagneticButton from '@/components/ui/MagneticButton';
import { CelebrationOverlay } from '@/components/ui/Celebration';
import { useAuth } from '@/lib/AuthContext';
import { formatUGX } from '@/lib/vipData';
import { playSound } from '@/lib/sound';

const STAT_CARDS = [
  { label: 'Wallet Balance', value: 0, icon: Wallet, color: 'from-emerald-500 to-teal-600', prefix: 'UGX ' },
  { label: "Today's Profit", value: 0, icon: TrendingUp, color: 'from-green-400 to-emerald-500', prefix: 'UGX ' },
  { label: 'Current VIP', value: '1 · Starter', icon: Crown, color: 'from-amber-400 to-yellow-500' },
  { label: 'Tasks Today', value: '0 / 3', icon: CheckSquare, color: 'from-sky-400 to-blue-500' },
  { label: 'Referral Earnings', value: 0, icon: Users, color: 'from-violet-400 to-purple-500', prefix: 'UGX ' },
  { label: 'Pending Withdrawal', value: 0, icon: Clock, color: 'from-rose-400 to-red-500', prefix: 'UGX ' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Trader';

  // Show welcome overlay once per browser session (first login/signup landing)
  useEffect(() => {
    const key = 'bondify_welcomed';
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      setCelebrate(true);
    }
  }, []);

  return (
    <div className="space-y-6">
      <CelebrationOverlay
        show={celebrate}
        title={`Welcome to Bondify, ${displayName}!`}
        subtitle="Your account is ready. Start trading treasury bonds today."
        onClose={() => setCelebrate(false)}
        autoDismiss={3500}
      />

      {/* Welcome header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Welcome, {displayName} 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">Your Bondify account is ready. Start by depositing funds or completing your first task.</p>
      </motion.div>

      {/* Video hero banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative overflow-hidden rounded-2xl"
        style={{ height: '220px' }}
      >
        {/* YouTube video background */}
        <div className="absolute inset-0 pointer-events-none">
          <iframe
            src="https://www.youtube.com/embed/vAdn7aLHpO0?autoplay=1&mute=1&loop=1&playlist=vAdn7aLHpO0&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1"
            style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'max(100%, 177.78vh)',
              height: 'max(100%, 56.25vw)',
              border: 'none', pointerEvents: 'none',
            }}
            allow="autoplay"
            title="hero"
          />
        </div>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-emerald-950/70 to-navy/80" />
        {/* Content */}
        <div className="relative z-10 h-full p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-emerald-300" />
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Get started</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Earn by Selling Australian Bonds</h2>
            <p className="text-white/70 text-sm mt-1">Deposit funds to start your bond distribution journey.</p>
          </div>
          <Link
            to="/dashboard/tasks"
            onClick={() => playSound('click')}
            className="flex items-center gap-2 bg-white text-emerald-700 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-emerald-50 transition-colors shrink-0"
          >
            Start Trading <ChevronRight size={16} />
          </Link>
        </div>
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Deposit', icon: Plus, to: '/dashboard/wallet' },
          { label: 'Withdraw', icon: ArrowUpRight, to: '/dashboard/withdrawals' },
          { label: 'Daily Gift', icon: Gift, to: '/dashboard/gift' },
          { label: 'Check-in', icon: Calendar, to: '/dashboard/gift' },
        ].map((a) => (
          <Link key={a.label} to={a.to}>
            <MagneticButton
              onClick={() => playSound('click')}
              strength={0.2}
              className="w-full py-3 rounded-xl glass font-medium text-sm flex items-center justify-center gap-2 text-foreground"
            >
              <a.icon size={16} /> {a.label}
            </MagneticButton>
          </Link>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <GlassCard glow hover className="h-full">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                  <card.icon className="text-white" size={18} />
                </div>
                {card.label === 'Wallet Balance' && (
                  <button onClick={() => setBalanceHidden((h) => !h)} className="text-muted-foreground hover:text-foreground">
                    {balanceHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-bold mt-1">
                {balanceHidden && card.label === 'Wallet Balance'
                  ? '••••••'
                  : typeof card.value === 'number'
                    ? `${card.prefix ?? ''}${formatUGX(card.value).replace('UGX ', '')}`
                    : card.value}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Recent transactions — empty state */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <GlassCard hover={false}>
          <h3 className="font-semibold mb-4">Recent Transactions</h3>
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Wallet size={24} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">No transactions yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">Your bond sales and deposits will appear here.</p>
            </div>
            <Link
              to="/dashboard/wallet"
              onClick={() => playSound('click')}
              className="text-sm font-medium text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
            >
              Make your first deposit <ChevronRight size={14} />
            </Link>
          </div>
        </GlassCard>
      </motion.div>

    </div>
  );
}
