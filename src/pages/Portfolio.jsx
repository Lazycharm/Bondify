import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, Wallet, Crown } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import CountUp from '@/components/ui/count-up';
import { formatUGX, VIP_LEVELS } from '@/lib/vipData';
import { getDeposits, getWalletBalance, getBonusBalance } from '@/lib/depositStore';
import { getUserWithdrawals } from '@/lib/withdrawalStore';
import { getTotalBondIncome } from '@/lib/bondStore';
import { useAuth } from '@/lib/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const PIE_COLORS = ['#10b981', '#f59e0b', '#0ea5e9', '#8b5cf6'];

function getTaskState() {
  try {
    const raw = localStorage.getItem('bondify_task_state');
    return raw ? JSON.parse(raw) : { totalCompleted: 0, sessionDay: 1 };
  } catch { return { totalCompleted: 0, sessionDay: 1 }; }
}

function getCurrentVip(balance) {
  const sorted = [...VIP_LEVELS].sort((a, b) => b.min_investment - a.min_investment);
  return sorted.find((v) => balance >= v.min_investment) ?? VIP_LEVELS[0];
}

function buildMonthlyChart(deposits) {
  const map = {};
  const sortedDeps = [...deposits].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  let running = 0;
  sortedDeps.filter((d) => d.status === 'approved').forEach((d) => {
    const label = new Date(d.created_at).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
    running += parseInt(d.amount, 10);
    map[label] = running;
  });
  // Ensure at least one point even with no deposits
  if (Object.keys(map).length === 0) {
    const now = new Date().toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
    map[now] = 0;
  }
  return Object.entries(map).map(([month, value]) => ({ month, value }));
}

export default function Portfolio() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    const deposits = getDeposits();
    const myDeposits = deposits.filter((d) => d.userId === user.id);
    const approvedDeposits = myDeposits.filter((d) => d.status === 'approved');
    const totalDeposited = approvedDeposits.reduce((s, d) => s + parseInt(d.amount, 10), 0);

    const withdrawals = getUserWithdrawals(user.id);
    const totalWithdrawn = withdrawals
      .filter((w) => w.status === 'approved')
      .reduce((s, w) => s + parseInt(w.amount, 10), 0);

    const walletBalance = getWalletBalance();
    const bonusBalance = getBonusBalance();
    const giftCredits = parseInt(localStorage.getItem('bondify_gift_credits') || '0', 10);

    const taskState = getTaskState();
    const vip = getCurrentVip(walletBalance);

    // Allocation pie: breakdown of what makes up the wallet
    const allocation = [
      { name: 'Deposits', value: totalDeposited || 0, color: PIE_COLORS[0] },
      { name: 'Bonus', value: bonusBalance || 0, color: PIE_COLORS[1] },
      { name: 'Gifts', value: giftCredits || 0, color: PIE_COLORS[2] },
    ].filter((a) => a.value > 0);

    if (allocation.length === 0) allocation.push({ name: 'No funds yet', value: 1, color: '#334155' });

    const monthlyChart = buildMonthlyChart(myDeposits);

    // Recent deposits as "active investments"
    const activeInvestments = approvedDeposits.slice(0, 6).map((d) => ({
      id: d.id,
      label: `${d.network?.toUpperCase() ?? 'Bank'} Deposit`,
      amount: parseInt(d.amount, 10),
      date: d.created_at,
      status: 'active',
    }));

    const totalProfits = getTotalBondIncome(user.id);

    setData({
      walletBalance,
      totalDeposited,
      totalWithdrawn,
      bonusBalance,
      totalProfits,
      tasksCompleted: taskState.totalCompleted ?? 0,
      currentDay: taskState.sessionDay ?? 1,
      vip,
      allocation,
      monthlyChart,
      activeInvestments,
      withdrawals: withdrawals.slice(0, 5),
    });
  }, [user?.id]);

  if (!data) return <div className="text-center py-20 text-muted-foreground text-sm">Loading portfolio…</div>;

  const summaryCards = [
    { label: 'Wallet Balance', value: data.walletBalance, color: 'from-emerald-500 to-teal-600', numeric: true },
    { label: 'Total Profits', value: data.totalProfits, color: 'from-green-400 to-emerald-500', numeric: true },
    { label: 'Total Deposited', value: data.totalDeposited, color: 'from-sky-400 to-blue-500', numeric: true },
    { label: 'Total Withdrawn', value: data.totalWithdrawn, color: 'from-rose-400 to-red-500', numeric: true },
    { label: 'Tasks Completed', value: data.tasksCompleted, color: 'from-violet-400 to-purple-500', numeric: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl" style={{ height: 160 }}>
        <img src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&q=80" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-emerald-900/70 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center p-6">
          <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          <p className="text-white/70 text-sm mt-1">Your investment performance and wallet overview.</p>
          <div className="flex items-center gap-2 mt-3">
            <Crown size={14} className="text-amber-400" />
            <span className={`text-xs font-bold bg-gradient-to-r ${data.vip.color} bg-clip-text text-transparent`}>
              VIP {data.vip.level} · {data.vip.name}
            </span>
            <span className="text-white/50 text-xs">· Day {data.currentDay} of 7</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {summaryCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <GlassCard glow hover>
              <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${s.color} mb-3`} />
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold mt-1">
                {s.numeric ? (
                  <CountUp value={s.value} prefix="UGX " />
                ) : (
                  <CountUp value={s.value} />
                )}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <GlassCard hover={false}>
          <h3 className="font-semibold mb-4">Wallet Breakdown</h3>
          {data.allocation[0].name === 'No funds yet' ? (
            <div className="h-56 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Wallet size={32} className="opacity-20" />
              <p className="text-sm">No funds deposited yet.</p>
            </div>
          ) : (
            <>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.allocation} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={3}>
                      {data.allocation.map((e) => <Cell key={e.name} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatUGX(v)} contentStyle={{ borderRadius: 12, fontSize: 12, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {data.allocation.map((a) => (
                  <div key={a.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} />
                    {a.name} — {formatUGX(a.value)}
                  </div>
                ))}
              </div>
            </>
          )}
        </GlassCard>

        <GlassCard hover={false}>
          <h3 className="font-semibold mb-4">Deposit History</h3>
          {data.monthlyChart.every(m => m.value === 0) ? (
            <div className="h-56 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <TrendingUp size={32} className="opacity-20" />
              <p className="text-sm">Make your first deposit to see your growth.</p>
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyChart}>
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000000 ? (v/1000000).toFixed(1)+'M' : v >= 1000 ? (v/1000).toFixed(0)+'K' : v} />
                  <Tooltip formatter={(v) => formatUGX(v)} contentStyle={{ borderRadius: 12, fontSize: 12, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Active Investments */}
      <GlassCard hover={false}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Active Investments</h3>
          <span className="text-xs text-muted-foreground">{data.activeInvestments.length} deposits</span>
        </div>
        {data.activeInvestments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
            <Wallet size={28} className="opacity-20" />
            <p className="text-sm">No approved deposits yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.activeInvestments.map((inv, i) => (
              <motion.div key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }} className="p-4 rounded-xl bg-muted/40 flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <ArrowDownLeft size={16} className="text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{inv.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(inv.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-500 text-sm">{formatUGX(inv.amount)}</p>
                  <p className="text-[10px] text-emerald-400 font-medium mt-0.5">Active</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Withdrawal History */}
      {data.withdrawals.length > 0 && (
        <GlassCard hover={false}>
          <h3 className="font-semibold mb-4">Recent Withdrawals</h3>
          <div className="space-y-2">
            {data.withdrawals.map((w) => (
              <div key={w.id} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                    <ArrowUpRight size={14} className="text-rose-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{w.method} → {w.account}</p>
                    <p className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-rose-400 text-sm">-{formatUGX(w.amount)}</p>
                  <p className={`text-[10px] font-medium capitalize ${w.status === 'approved' ? 'text-emerald-500' : w.status === 'rejected' ? 'text-rose-500' : 'text-amber-500'}`}>{w.status}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
