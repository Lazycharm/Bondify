import { motion } from 'framer-motion';
import { Wallet, Gift, Users, Clock, Download, Search, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import CountUp from '@/components/ui/count-up';
import MagneticButton from '@/components/ui/MagneticButton';
import { formatUGX } from '@/lib/vipData';
import { playSound } from '@/lib/sound';

const BALANCES = [
  { label: 'Main Balance', value: 845000, icon: Wallet, color: 'from-emerald-500 to-teal-600' },
  { label: 'Bonus Balance', value: 15000, icon: Gift, color: 'from-amber-400 to-yellow-500' },
  { label: 'Referral Earnings', value: 45000, icon: Users, color: 'from-violet-400 to-purple-500' },
  { label: 'Pending', value: 0, icon: Clock, color: 'from-rose-400 to-red-500' },
];

const TRANSACTIONS = [
  { type: 'profit', desc: 'Daily bond profit', amount: 12500, date: 'Jul 13, 2026', method: 'System', icon: ArrowUpRight },
  { type: 'investment', desc: '91-Day T-Bill', amount: -50000, date: 'Jul 13, 2026', method: 'System', icon: ArrowDownLeft },
  { type: 'referral', desc: 'Referral commission', amount: 1750, date: 'Jul 12, 2026', method: 'System', icon: ArrowUpRight },
  { type: 'checkin', desc: 'Check-in reward', amount: 300, date: 'Jul 12, 2026', method: 'System', icon: Gift },
  { type: 'deposit', desc: 'MTN MoMo deposit', amount: 100000, date: 'Jul 11, 2026', method: 'MTN Mobile Money', icon: ArrowDownLeft },
  { type: 'withdrawal', desc: 'Weekend withdrawal', amount: -230000, date: 'Jul 6, 2026', method: 'Airtel Money', icon: ArrowUpRight },
];

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Wallet</h1>
          <p className="text-muted-foreground text-sm">Manage your balances and transactions.</p>
        </div>
        <MagneticButton onClick={() => playSound('click')} className="px-4 py-2 rounded-xl glass text-sm font-medium flex items-center gap-2">
          <Download size={16} /> Export PDF
        </MagneticButton>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {BALANCES.map((b, i) => (
          <motion.div key={b.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <GlassCard glow hover>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center mb-3`}>
                <b.icon className="text-white" size={18} />
              </div>
              <p className="text-xs text-muted-foreground">{b.label}</p>
              <p className="text-xl font-bold mt-1">
                <CountUp value={b.value} prefix="UGX " />
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Bonus rule notice */}
      <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm flex items-start gap-3">
        <Gift className="text-amber-500 shrink-0 mt-0.5" size={18} />
        <p className="text-foreground/80">
          <span className="font-semibold text-amber-500">Bonus rule:</span> Your UGX 10,000 registration bonus becomes
          withdrawable only after you deposit at least UGX 20,000 and meet all platform terms.
        </p>
      </div>

      {/* Transaction history */}
      <GlassCard hover={false}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Transaction History</h3>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass text-sm">
            <Search size={14} className="text-muted-foreground" />
            <input placeholder="Search..." className="bg-transparent outline-none w-24 sm:w-40 text-sm" />
          </div>
        </div>
        <div className="space-y-2">
          {TRANSACTIONS.map((tx, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 py-2.5 border-b border-border last:border-0"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.amount > 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                <tx.icon size={16} className={tx.amount > 0 ? 'text-emerald-500' : 'text-rose-500'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{tx.desc}</p>
                <p className="text-xs text-muted-foreground">{tx.date} · {tx.method}</p>
              </div>
              <span className={`text-sm font-semibold ${tx.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {tx.amount > 0 ? '+' : ''}{formatUGX(tx.amount)}
              </span>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}