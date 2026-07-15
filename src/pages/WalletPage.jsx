import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet, Gift, Users, Search,
  ArrowUpRight, ArrowDownLeft, Plus, ChevronRight, BarChart2, TrendingUp,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import MagneticButton from '@/components/ui/MagneticButton';
import { useAuth } from '@/lib/AuthContext';
import { getWalletBalance, getUserDeposits, getBonusBalance, isBonusWithdrawable } from '@/lib/depositStore';
import { getUserWithdrawals } from '@/lib/withdrawalStore';
import { getTotalInvested, getTotalBondIncome } from '@/lib/bondStore';
import { calcReferralEarnings } from '@/lib/referralStore';
import { formatUGX } from '@/lib/vipData';
import { playSound } from '@/lib/sound';

const STATUS_COLOR = {
  pending: 'text-amber-500',
  approved: 'text-emerald-500',
  rejected: 'text-rose-500',
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function WalletPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [bonusUnlocked, setBonusUnlocked] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [referralEarned, setReferralEarned] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [totalProfits, setTotalProfits] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setBalance(getWalletBalance());
    setBonus(getBonusBalance());
    setBonusUnlocked(isBonusWithdrawable());
    if (user?.id) {
      setDeposits(getUserDeposits(user.id));
      setWithdrawals(getUserWithdrawals(user.id));
      const e = calcReferralEarnings(user.id);
      setReferralEarned(e.total);
      setTotalInvested(getTotalInvested(user.id));
      setTotalProfits(getTotalBondIncome(user.id));
    }
  }, [user]);

  const allTx = [
    ...deposits.map((d) => ({ ...d, txType: 'deposit' })),
    ...withdrawals.map((w) => ({ ...w, txType: 'withdrawal' })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const filtered = allTx.filter((tx) =>
    !search || tx.txType.includes(search.toLowerCase()) || tx.status.includes(search.toLowerCase())
  );

  const balanceCards = [
    { label: 'Main Balance', value: balance, icon: Wallet, color: 'from-emerald-500 to-teal-600' },
    { label: 'Total Profits', value: totalProfits, icon: TrendingUp, color: 'from-green-400 to-emerald-500' },
    { label: 'Welcome Bonus', value: bonus, icon: Gift, color: 'from-amber-400 to-yellow-500', sub: bonusUnlocked ? 'Withdrawable now!' : 'Recharge to unlock' },
    { label: 'Referral Earnings', value: referralEarned, icon: Users, color: 'from-violet-400 to-purple-500' },
    { label: 'Bonds Invested', value: totalInvested, icon: BarChart2, color: 'from-sky-400 to-blue-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Wallet</h1>
          <p className="text-muted-foreground text-sm">Your balances and transaction history.</p>
        </div>
        <Link to="/dashboard/deposit">
          <MagneticButton
            onClick={() => playSound('click')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Plus size={16} /> Recharge
          </MagneticButton>
        </Link>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {balanceCards.map((b, i) => (
          <motion.div key={b.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <GlassCard glow hover>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center mb-3`}>
                <b.icon className="text-white" size={18} />
              </div>
              <p className="text-xs text-muted-foreground">{b.label}</p>
              <p className="text-xl font-bold mt-1">{formatUGX(b.value)}</p>
              {b.sub && (
                <p className={`text-[10px] mt-0.5 font-medium ${bonusUnlocked && b.sub.includes('Withdrawable') ? 'text-emerald-500' : 'text-amber-500'}`}>{b.sub}</p>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Bonus info */}
      <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm flex items-start gap-3">
        <Gift className="text-amber-500 shrink-0 mt-0.5" size={18} />
        <p className="text-foreground/80">
          <span className="font-semibold text-amber-500">Welcome Bonus — UGX 5,000:</span>{' '}
          {bonusUnlocked
            ? 'Great — your bonus is unlocked and ready to withdraw! Go to Withdrawals to claim it.'
            : 'Make your first recharge and your UGX 5,000 welcome bonus unlocks immediately — no waiting.'}
        </p>
      </div>

      {/* Empty state */}
      {balance === 0 && deposits.length === 0 && (
        <GlassCard hover={false} className="text-center py-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3">
            <Wallet size={24} className="text-emerald-500" />
          </div>
          <p className="font-semibold">No balance yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Recharge your wallet to start earning daily income from bonds.</p>
          <Link to="/dashboard/deposit">
            <button className="flex items-center gap-2 mx-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold">
              Recharge Now <ChevronRight size={16} />
            </button>
          </Link>
        </GlassCard>
      )}

      {/* Transaction history */}
      {allTx.length > 0 && (
        <GlassCard hover={false}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h3 className="font-semibold">Recent Transactions</h3>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass text-sm">
              <Search size={14} className="text-muted-foreground" />
              <input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none w-24 sm:w-32 text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            {filtered.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 py-2.5 border-b border-border last:border-0"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tx.txType === 'deposit' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                  {tx.txType === 'deposit'
                    ? <ArrowDownLeft size={16} className="text-emerald-500" />
                    : <ArrowUpRight size={16} className="text-rose-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium capitalize">
                    {tx.txType === 'deposit' ? 'Recharge' : 'Withdrawal'} · {tx.network || tx.method}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)} · {tx.id?.slice(0, 12)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${tx.txType === 'deposit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {tx.txType === 'deposit' ? '+' : '-'}{formatUGX(tx.amount)}
                  </p>
                  <p className={`text-xs capitalize ${STATUS_COLOR[tx.status]}`}>{tx.status}</p>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center py-6 text-sm text-muted-foreground">No transactions match your search.</p>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
