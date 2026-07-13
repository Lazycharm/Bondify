import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, Clock, Lock, ArrowRight, ChevronRight } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import MagneticButton from '@/components/ui/MagneticButton';
import { VIP_LEVELS, formatUGX, getBondsPerDay } from '@/lib/vipData';
import { getWalletBalance } from '@/lib/depositStore';
import { playSound } from '@/lib/sound';

const BONDS = [
  { id: 1, name: '91-Day T-Bill', type: 'Treasury Bill', vip: 1, entry: 20000, maturity: 91, roi: 8, fill: 72, description: 'Short-term Australian government security. Fast liquidity, low risk.' },
  { id: 2, name: '182-Day T-Bill', type: 'Treasury Bill', vip: 2, entry: 50000, maturity: 182, roi: 12, fill: 58, description: 'Half-year T-Bill with steady quarterly yields.' },
  { id: 3, name: '364-Day T-Bill', type: 'Treasury Bill', vip: 3, entry: 100000, maturity: 364, roi: 18, fill: 65, description: 'Annual treasury bill — maximise yearly returns.' },
  { id: 4, name: '2-Year Treasury Bond', type: 'Treasury Bond', vip: 4, entry: 250000, maturity: 730, roi: 24, fill: 43, description: 'Medium-term bond with semi-annual coupon payments.' },
  { id: 5, name: '3-Year Savings Bond', type: 'Savings Bond', vip: 3, entry: 80000, maturity: 1095, roi: 30, fill: 61, description: 'Retail savings bond — ideal for consistent earners.' },
  { id: 6, name: '5-Year Treasury Bond', type: 'Treasury Bond', vip: 5, entry: 500000, maturity: 1825, roi: 36, fill: 50, description: 'Long-term bond for sustained portfolio growth.' },
  { id: 7, name: '7-Year Treasury Bond', type: 'Treasury Bond', vip: 7, entry: 2000000, maturity: 2555, roi: 46, fill: 31, description: 'High-yield bond for serious portfolio builders.' },
  { id: 8, name: '10-Year Infrastructure Bond', type: 'Infrastructure Bond', vip: 6, entry: 1000000, maturity: 3650, roi: 55, fill: 27, description: 'Tax-efficient infra bond funding national projects.' },
  { id: 9, name: '15-Year Infrastructure Bond', type: 'Infrastructure Bond', vip: 8, entry: 5000000, maturity: 5475, roi: 65, fill: 18, description: 'Premium infra bond with maximum yield potential.' },
];

const TYPE_FILTERS = ['All', 'Treasury Bill', 'Treasury Bond', 'Savings Bond', 'Infrastructure Bond'];

function getCurrentVipLevel(balance) {
  const sorted = [...VIP_LEVELS].sort((a, b) => b.min_investment - a.min_investment);
  return (sorted.find((v) => balance >= v.min_investment) ?? VIP_LEVELS[0]).level;
}

export default function Marketplace() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('roi');
  const [userVip, setUserVip] = useState(1);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const bal = getWalletBalance();
    setBalance(bal);
    setUserVip(getCurrentVipLevel(bal));
  }, []);

  const filtered = useMemo(() => {
    let list = BONDS.filter((b) => {
      const matchSearch = b.name.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'All' || b.type === typeFilter;
      return matchSearch && matchType;
    });
    if (sortBy === 'roi') list = [...list].sort((a, b) => b.roi - a.roi);
    if (sortBy === 'entry') list = [...list].sort((a, b) => a.entry - b.entry);
    if (sortBy === 'maturity') list = [...list].sort((a, b) => a.maturity - b.maturity);
    return list;
  }, [search, typeFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl" style={{ height: 160 }}>
        <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-emerald-900/70 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center p-6">
          <h1 className="text-2xl font-bold text-white">Bond Marketplace</h1>
          <p className="text-white/70 text-sm mt-1">Browse Australian government bond offerings available to distribute.</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-white/10 text-white/90">
              Your VIP: L{userVip} · {VIP_LEVELS[userVip - 1]?.name}
            </span>
            <span className="text-xs text-white/60">
              · {getBondsPerDay(userVip)} bonds/day
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <GlassCard hover={false} className="space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bonds..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); playSound('click'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === t ? 'bg-emerald-500 text-white' : 'glass text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-auto">
            <Filter size={13} className="text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1.5 rounded-lg bg-background/60 border border-border text-xs focus:outline-none"
            >
              <option value="roi">Highest ROI</option>
              <option value="entry">Lowest Entry</option>
              <option value="maturity">Shortest Term</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{filtered.length} bonds available · {filtered.filter(b => b.vip <= userVip).length} accessible at your level</p>
      </GlassCard>

      {/* Bond Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((bond, i) => {
          const vip = VIP_LEVELS[bond.vip - 1];
          const accessible = bond.vip <= userVip;
          const estReturn = Math.round(bond.entry * (1 + bond.roi / 100));

          return (
            <motion.div
              key={bond.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard hover={accessible} className={`h-full flex flex-col ${!accessible ? 'opacity-70' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-bold text-sm leading-tight">{bond.name}</h3>
                    <span className="text-xs text-muted-foreground">{bond.type}</span>
                  </div>
                  <span className={`shrink-0 px-2 py-1 rounded-lg text-[10px] font-bold text-white bg-gradient-to-r ${vip?.color || 'from-slate-400 to-slate-500'}`}>
                    L{bond.vip}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mb-4 flex-1">{bond.description}</p>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1"><TrendingUp size={13} /> Min. Deposit</span>
                    <span className="font-semibold">{formatUGX(bond.entry)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1"><Clock size={13} /> Maturity</span>
                    <span className="font-semibold">{bond.maturity < 365 ? `${bond.maturity}d` : `${(bond.maturity / 365).toFixed(bond.maturity % 365 === 0 ? 0 : 1)}yr`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Return</span>
                    <span className="font-semibold text-emerald-500">{formatUGX(estReturn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ROI</span>
                    <span className="font-semibold text-amber-500">+{bond.roi}%</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Tranche subscribed</span>
                    <span>{bond.fill}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${bond.fill}%` }} />
                  </div>
                </div>

                {accessible ? (
                  <Link to="/dashboard/tasks" onClick={() => playSound('success')}>
                    <MagneticButton className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold flex items-center justify-center gap-2">
                      Start Selling <ArrowRight size={15} />
                    </MagneticButton>
                  </Link>
                ) : (
                  <div className="w-full py-2.5 rounded-xl bg-muted/50 border border-border text-muted-foreground text-xs font-medium flex items-center justify-center gap-2">
                    <Lock size={13} />
                    Requires VIP {bond.vip} — deposit {formatUGX(VIP_LEVELS[bond.vip - 1]?.min_investment)}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground text-sm">No bonds match your filters.</div>
      )}

      {/* Upgrade CTA if locked bonds exist */}
      {filtered.some(b => b.vip > userVip) && (
        <GlassCard hover={false} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-semibold">Unlock higher-yield bonds</p>
            <p className="text-sm text-muted-foreground mt-0.5">Deposit more to reach the next VIP tier and access premium bonds.</p>
          </div>
          <Link to="/dashboard/deposit" onClick={() => playSound('click')}>
            <MagneticButton className="shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-sm font-semibold flex items-center gap-2">
              Upgrade Now <ChevronRight size={15} />
            </MagneticButton>
          </Link>
        </GlassCard>
      )}
    </div>
  );
}
