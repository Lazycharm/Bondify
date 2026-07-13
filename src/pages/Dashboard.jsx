import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingUp, Crown, CheckSquare, Users, Clock,
  Gift, Calendar, ArrowUpRight, ArrowDownLeft, Plus, Eye,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import MagneticButton from '@/components/ui/MagneticButton';
import CountUp from '@/components/ui/count-up';
import { CelebrationOverlay } from '@/components/ui/Celebration';
import { formatUGX, formatUGXShort } from '@/lib/vipData';
import { playSound } from '@/lib/sound';
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
} from 'recharts';

const WALLET_CARDS = [
  { label: 'Wallet Balance', value: 845000, icon: Wallet, color: 'from-emerald-500 to-teal-600', decimals: 0 },
  { label: "Today's Profit", value: 12500, icon: TrendingUp, color: 'from-green-400 to-emerald-500', decimals: 0 },
  { label: 'Current VIP', value: 2, icon: Crown, color: 'from-amber-400 to-yellow-500', suffix: ' · Bronze' },
  { label: 'Tasks Remaining', value: 3, icon: CheckSquare, color: 'from-sky-400 to-blue-500', suffix: '/ 8' },
  { label: 'Referral Earnings', value: 45000, icon: Users, color: 'from-violet-400 to-purple-500', decimals: 0 },
  { label: 'Pending Withdrawal', value: 0, icon: Clock, color: 'from-rose-400 to-red-500', decimals: 0 },
];

const GROWTH_DATA = [
  { day: 'Mon', value: 42000 }, { day: 'Tue', value: 48000 },
  { day: 'Wed', value: 55000 }, { day: 'Thu', value: 51000 },
  { day: 'Fri', value: 67000 }, { day: 'Sat', value: 78000 },
  { day: 'Sun', value: 84500 },
];

const RECENT_TX = [
  { type: 'profit', desc: 'Daily bond profit', amount: 12500, time: '2h ago', icon: ArrowUpRight },
  { type: 'investment', desc: '91-Day T-Bill purchased', amount: -50000, time: '5h ago', icon: ArrowDownLeft },
  { type: 'referral', desc: 'Referral commission (L1)', amount: 1750, time: '8h ago', icon: ArrowUpRight },
  { type: 'checkin', desc: 'Daily check-in reward', amount: 300, time: '1d ago', icon: Gift },
];

const BANNERS = [
  { title: '5-Year Infrastructure Bond', subtitle: 'Limited offer · 14.5% yield', color: 'from-emerald-500 to-teal-700', image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80' },
  { title: 'Weekend Withdrawals Open', subtitle: 'Saturday & Sunday only', color: 'from-amber-500 to-orange-600', image: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=1200&q=80' },
  { title: 'Gift Code: TREASURY100', subtitle: 'Claim your bonus today', color: 'from-violet-500 to-purple-700', image: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c0caf?w=1200&q=80' },
];

export default function Dashboard() {
  const [bannerIdx, setBannerIdx] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [balanceHidden, setBalanceHidden] = useState(false);

  // auto-rotate banners
  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIdx((i) => (i + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const banner = BANNERS[bannerIdx];

  return (
    <div className="space-y-6">
      <CelebrationOverlay
        show={celebrate}
        title="Welcome back!"
        subtitle="Your portfolio grew by UGX 12,500 today"
        onClose={() => setCelebrate(false)}
        autoDismiss={3000}
      />

      {/* Hero banner (auto-changing) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl h-44 sm:h-52"
      >
        <img src={banner.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className={`absolute inset-0 bg-gradient-to-r ${banner.color} animate-gradient opacity-80`} />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
        <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col justify-between">
          <div>
            <motion.div
              key={bannerIdx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white">{banner.title}</h2>
              <p className="text-white/80 mt-1">{banner.subtitle}</p>
            </motion.div>
          </div>
          <div className="flex gap-1.5">
            {BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setBannerIdx(i); playSound('click'); }}
                className={`h-1.5 rounded-full transition-all ${i === bannerIdx ? 'w-8 bg-white' : 'w-1.5 bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Deposit', icon: Plus, action: () => { playSound('success'); setCelebrate(true); } },
          { label: 'Withdraw', icon: ArrowUpRight, action: () => playSound('click') },
          { label: 'Daily Gift', icon: Gift, action: () => playSound('click') },
          { label: 'Check-in', icon: Calendar, action: () => { playSound('coin'); setCelebrate(true); } },
        ].map((a) => (
          <MagneticButton
            key={a.label}
            onClick={a.action}
            strength={0.2}
            className="py-3 rounded-xl glass font-medium text-sm flex items-center justify-center gap-2 text-foreground"
          >
            <a.icon size={16} /> {a.label}
          </MagneticButton>
        ))}
      </div>

      {/* Wallet cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {WALLET_CARDS.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <GlassCard glow hover className="h-full">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                  <card.icon className="text-white" size={18} />
                </div>
                {card.label === 'Wallet Balance' && (
                  <button onClick={() => setBalanceHidden((h) => !h)} className="text-muted-foreground hover:text-foreground">
                    <Eye size={16} />
                  </button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-bold mt-1">
                {balanceHidden && card.label === 'Wallet Balance' ? '••••••' : (
                  card.label.includes('VIP') || card.label.includes('Tasks') ? (
                    <CountUp value={card.value} suffix={card.suffix || ''} />
                  ) : (
                    <CountUp value={card.value} prefix="UGX " />
                  )
                )}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Chart + Recent transactions */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Growth chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <GlassCard hover={false} className="h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Investment Growth</h3>
                <p className="text-xs text-muted-foreground">Last 7 days · sample data</p>
              </div>
              <span className="text-emerald-500 font-semibold text-sm flex items-center gap-1">
                <TrendingUp size={14} /> +101%
              </span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={GROWTH_DATA}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatUGXShort(v).replace('UGX ', '')} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
                    formatter={(v) => [formatUGX(v), 'Balance']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fill="url(#growthGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Recent transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard hover={false} className="h-full">
            <h3 className="font-semibold mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {RECENT_TX.map((tx, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.amount > 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                    <tx.icon size={16} className={tx.amount > 0 ? 'text-emerald-500' : 'text-rose-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.desc}</p>
                    <p className="text-xs text-muted-foreground">{tx.time}</p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatUGX(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <p className="text-center text-xs text-muted-foreground pt-2">
        Sample demo data — all balances and figures shown are illustrative.
      </p>
    </div>
  );
}