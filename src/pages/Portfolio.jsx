import { motion } from 'framer-motion';
import { TrendingUp, Download, FileText } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import CountUp from '@/components/ui/count-up';
import MagneticButton from '@/components/ui/MagneticButton';
import { formatUGX } from '@/lib/vipData';
import { playSound } from '@/lib/sound';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const PORTFOLIO_SUMMARY = [
  { label: 'Total Invested', value: 450000, color: 'from-emerald-500 to-teal-600' },
  { label: 'Projected Returns', value: 612000, color: 'from-amber-400 to-yellow-500' },
  { label: 'Active Bonds', value: 4, color: 'from-sky-400 to-blue-500' },
  { label: 'Completed Bonds', value: 7, color: 'from-violet-400 to-purple-500' },
];

const ALLOCATION = [
  { name: 'T-Bills', value: 180000, color: '#10b981' },
  { name: 'Treasury Bonds', value: 150000, color: '#f59e0b' },
  { name: 'Infra Bonds', value: 80000, color: '#0ea5e9' },
  { name: 'Savings', value: 40000, color: '#8b5cf6' },
];

const PERFORMANCE = [
  { month: 'Feb', value: 210000 },
  { month: 'Mar', value: 265000 },
  { month: 'Apr', value: 310000 },
  { month: 'May', value: 380000 },
  { month: 'Jun', value: 415000 },
  { month: 'Jul', value: 450000 },
];

const BONDS = [
  { name: '91-Day T-Bill', status: 'active', invested: 20000, projected: 24500, progress: 45 },
  { name: '2-Year Bond', status: 'active', invested: 50000, projected: 64000, progress: 30 },
  { name: 'Green Bond', status: 'pending', invested: 35000, projected: 44800, progress: 0 },
  { name: '5-Year Infra Bond', status: 'active', invested: 80000, projected: 108000, progress: 60 },
];

export default function Portfolio() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl">
        <img src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&q=80" alt="" className="w-full h-32 sm:h-40 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-emerald-900/70 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Portfolio</h1>
            <p className="text-white/70 text-sm">Track your bond investments and performance.</p>
          </div>
          <MagneticButton onClick={() => playSound('click')} className="px-4 py-2 rounded-xl glass-strong text-sm font-medium flex items-center gap-2 text-white">
            <Download size={16} /> Statements
          </MagneticButton>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PORTFOLIO_SUMMARY.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <GlassCard glow hover>
              <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${s.color} mb-3`} />
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold mt-1">
                {s.label.includes('Bonds') ? <CountUp value={s.value} /> : <CountUp value={s.value} prefix="UGX " />}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <GlassCard hover={false}>
          <h3 className="font-semibold mb-4">Asset Allocation</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ALLOCATION} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {ALLOCATION.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v) => formatUGX(v)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {ALLOCATION.map((a) => (
              <div key={a.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} />
                {a.name}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <h3 className="font-semibold mb-4">Historical Performance</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PERFORMANCE}>
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => (v / 1000) + 'K'} />
                <Tooltip formatter={(v) => formatUGX(v)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Active bonds */}
      <GlassCard hover={false}>
        <h3 className="font-semibold mb-4">Purchased Bonds</h3>
        <div className="space-y-3">
          {BONDS.map((b, i) => (
            <motion.div key={b.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="p-4 rounded-xl bg-muted/40">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{formatUGX(b.invested)} → {formatUGX(b.projected)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    b.status === 'active' ? 'bg-emerald-500/15 text-emerald-500' :
                    b.status === 'pending' ? 'bg-amber-500/15 text-amber-500' : 'bg-muted text-muted-foreground'
                  }`}>{b.status}</span>
                  <FileText size={16} className="text-muted-foreground cursor-pointer hover:text-foreground" />
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${b.progress}%` }} transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}