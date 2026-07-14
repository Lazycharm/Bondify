import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Clock, Search } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { formatUGX } from '@/lib/vipData';

function getAllBonds() {
  const bonds = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('bondify_bonds_')) {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        bonds.push(...data);
      }
    }
  } catch {}
  return bonds;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminBonds() {
  const [bonds, setBonds] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const all = getAllBonds();
    all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setBonds(all);
  }, []);

  const filtered = bonds.filter((b) =>
    !search || b.product_name?.toLowerCase().includes(search.toLowerCase()) || b.userId?.toLowerCase().includes(search.toLowerCase())
  );

  const totalInvested = bonds.reduce((s, b) => s + (b.price || 0), 0);
  const totalDailyIncome = bonds.reduce((s, b) => s + (b.daily_income || 0), 0);
  const activeBonds = bonds.filter((b) => b.is_active).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Active Bonds</h1>
        <p className="text-sm text-muted-foreground mt-1">All bond investments across all users.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Bonds', value: activeBonds, icon: BarChart2, color: 'from-emerald-500 to-teal-600' },
          { label: 'Total Invested', value: formatUGX(totalInvested), icon: TrendingUp, color: 'from-amber-400 to-orange-500', raw: true },
          { label: 'Daily Payouts', value: formatUGX(totalDailyIncome), icon: Clock, color: 'from-violet-400 to-purple-500', raw: true },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <GlassCard hover={false}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shrink-0`}>
                  <s.icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold">{s.raw ? s.value : s.value.toLocaleString()}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard hover={false}>
        <div className="flex items-center gap-3 mb-4">
          <Search size={15} className="text-muted-foreground" />
          <input
            placeholder="Search by user ID or bond name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No bonds found.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((bond, i) => {
              const pct = Math.min((bond.days_completed / bond.term_days) * 100, 100);
              return (
                <motion.div
                  key={bond.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 py-3 border-b border-border last:border-0"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${bond.color || 'from-emerald-500 to-teal-600'} flex items-center justify-center shrink-0`}>
                    <BarChart2 size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{bond.product_name}</p>
                    <p className="text-xs text-muted-foreground">User: {bond.userId?.slice(0, 12)} · Started {formatDate(bond.started_at)}</p>
                    <div className="h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden w-32">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Day {bond.days_completed} of {bond.term_days}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-emerald-400">+{formatUGX(bond.daily_income)}/day</p>
                    <p className="text-xs text-muted-foreground">{formatUGX(bond.price)} invested</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
