import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import MagneticButton from '@/components/ui/MagneticButton';
import { VIP_LEVELS, formatUGX } from '@/lib/vipData';
import { playSound } from '@/lib/sound';

const BONDS = [
  { id: 1, bond_name: '91-Day T-Bill', bond_type: 'Treasury Bill', vip_level: 1, investment_amount: 20000, maturity_days: 91, estimated_return: 21600, reward: 1600, progress: 40, description: 'Short-term government security with quick liquidity.' },
  { id: 2, bond_name: '182-Day T-Bill', bond_type: 'Treasury Bill', vip_level: 2, investment_amount: 50000, maturity_days: 182, estimated_return: 56000, reward: 6000, progress: 55, description: 'Half-year treasury bill with steady yields.' },
  { id: 3, bond_name: '364-Day T-Bill', bond_type: 'Treasury Bill', vip_level: 3, investment_amount: 100000, maturity_days: 364, estimated_return: 118000, reward: 18000, progress: 70, description: 'Annual treasury bill maximizing returns.' },
  { id: 4, bond_name: '2-Year Treasury Bond', bond_type: 'Treasury Bond', vip_level: 4, investment_amount: 250000, maturity_days: 730, estimated_return: 310000, reward: 60000, progress: 30, description: 'Medium-term bond with semi-annual coupons.' },
  { id: 5, bond_name: '5-Year Treasury Bond', bond_type: 'Treasury Bond', vip_level: 5, investment_amount: 500000, maturity_days: 1825, estimated_return: 680000, reward: 180000, progress: 50, description: 'Long-term bond for sustained wealth growth.' },
  { id: 6, bond_name: '10-Year Infrastructure Bond', bond_type: 'Infrastructure Bond', vip_level: 6, investment_amount: 1000000, maturity_days: 3650, estimated_return: 1550000, reward: 550000, progress: 20, description: 'Tax-efficient infra bond funding national projects.' },
  { id: 7, bond_name: '3-Year Savings Bond', bond_type: 'Savings Bond', vip_level: 3, investment_amount: 80000, maturity_days: 1095, estimated_return: 104000, reward: 24000, progress: 60, description: 'Retail savings bond, ideal for first-time investors.' },
  { id: 8, bond_name: '15-Year Infrastructure Bond', bond_type: 'Infrastructure Bond', vip_level: 8, investment_amount: 5000000, maturity_days: 5475, estimated_return: 8250000, reward: 3250000, progress: 15, description: 'Premium infra bond with maximum yield potential.' },
  { id: 9, bond_name: '7-Year Treasury Bond', bond_type: 'Treasury Bond', vip_level: 7, investment_amount: 2000000, maturity_days: 2555, estimated_return: 2920000, reward: 920000, progress: 25, description: 'High-yield bond for serious portfolio builders.' },
];

const TYPE_FILTERS = ['All', 'Treasury Bill', 'Treasury Bond', 'Savings Bond', 'Infrastructure Bond'];

export default function Marketplace() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [vipFilter, setVipFilter] = useState('All');
  const [sortBy, setSortBy] = useState('return');

  const filtered = useMemo(() => {
    let result = BONDS.filter((b) => {
      const matchesSearch = b.bond_name.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'All' || b.bond_type === typeFilter;
      const matchesVip = vipFilter === 'All' || b.vip_level <= parseInt(vipFilter);
      return matchesSearch && matchesType && matchesVip;
    });
    if (sortBy === 'return') result = [...result].sort((a, b) => b.estimated_return - a.estimated_return);
    if (sortBy === 'amount') result = [...result].sort((a, b) => a.investment_amount - b.investment_amount);
    if (sortBy === 'duration') result = [...result].sort((a, b) => a.maturity_days - b.maturity_days);
    return result;
  }, [search, typeFilter, vipFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl">
        <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80" alt="" className="w-full h-32 sm:h-40 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-emerald-900/70 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center p-6">
          <h1 className="text-2xl font-bold text-white">Investment Marketplace</h1>
          <p className="text-white/70 text-sm">Browse available treasury bond offerings and start investing.</p>
        </div>
      </div>

      {/* Search & Filters */}
      <GlassCard className="p-4 space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bonds..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); playSound('click'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === t ? 'bg-primary text-primary-foreground' : 'glass text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">VIP ≤</span>
            <select
              value={vipFilter}
              onChange={(e) => setVipFilter(e.target.value)}
              className="px-2 py-1.5 rounded-lg bg-background/60 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="All">All</option>
              {VIP_LEVELS.map((v) => (
                <option key={v.level} value={v.level}>L{v.level} · {v.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1.5 rounded-lg bg-background/60 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="return">Highest Return</option>
              <option value="amount">Lowest Entry</option>
              <option value="duration">Shortest Duration</option>
            </select>
          </div>
          <span className="text-xs text-muted-foreground ml-auto">{filtered.length} bonds found</span>
        </div>
      </GlassCard>

      {/* Bond Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((bond, i) => {
          const vip = VIP_LEVELS[bond.vip_level - 1];
          const roi = ((bond.estimated_return - bond.investment_amount) / bond.investment_amount * 100).toFixed(1);
          return (
            <motion.div
              key={bond.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard hover className="h-full flex flex-col p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-base">{bond.bond_name}</h3>
                    <span className="text-xs text-muted-foreground">{bond.bond_type}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold text-white bg-gradient-to-r ${vip?.color || 'from-slate-400 to-slate-500'}`}>
                    L{bond.vip_level}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mb-4 flex-1">{bond.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1"><TrendingUp size={14} /> Entry</span>
                    <span className="font-semibold">{formatUGX(bond.investment_amount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1"><Clock size={14} /> Maturity</span>
                    <span className="font-semibold">{bond.maturity_days} days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Est. Return</span>
                    <span className="font-semibold text-emerald-500">{formatUGX(bond.estimated_return)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">ROI</span>
                    <span className="font-semibold text-amber-500">+{roi}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Subscribed</span>
                    <span>{bond.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${bond.progress}%` }} />
                  </div>
                </div>

                <MagneticButton
                  onClick={() => playSound('success')}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold flex items-center justify-center gap-2"
                >
                  Invest Now <ArrowRight size={16} />
                </MagneticButton>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">No bonds match your filters.</p>
        </div>
      )}
    </div>
  );
}