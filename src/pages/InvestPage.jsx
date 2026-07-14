import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, BarChart2, Landmark, Globe, Star, Crown, Gem,
  X, ChevronRight, Info, Wallet, Clock, Layers,
} from 'lucide-react';
import { formatUGX } from '@/lib/vipData';
import { INVEST_PRODUCTS } from '@/lib/investData';

const LEVEL_ICONS = [TrendingUp, BarChart2, Landmark, Globe, Star, Gem, Crown];

function BondIcon({ level, color, shadow }) {
  const Icon = LEVEL_ICONS[level - 1] ?? TrendingUp;
  return (
    <div className={`relative w-[72px] h-[72px] rounded-2xl bg-gradient-to-br ${color} flex flex-col items-center justify-center shrink-0 shadow-xl ${shadow}`}>
      {/* Certificate lines decoration */}
      <div className="absolute inset-2 rounded-xl border border-white/20" />
      <Icon size={24} className="text-white relative z-10" />
      <span className="text-[9px] text-white/70 font-bold tracking-widest mt-0.5 relative z-10">BOND</span>
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="glass rounded-2xl px-3 py-3 flex-1 text-center">
      <p className="text-[10px] text-muted-foreground leading-none mb-1">{label}</p>
      <p className="text-sm font-bold leading-none">{value}</p>
    </div>
  );
}

export default function InvestPage() {
  const [tab, setTab] = useState('products');
  const [selected, setSelected] = useState(null);

  return (
    <div className="max-w-lg mx-auto pb-32 lg:pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-2xl font-bold">Bond Investment</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Buy a bond package · Earn daily UGX income · 360-day cycle
        </p>
      </motion.div>

      {/* Stats strip */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex gap-2 mb-5">
        <StatPill label="Total Invested" value="UGX 0" />
        <StatPill label="Active Bonds" value="0" />
        <StatPill label="Today's Income" value="UGX 0" />
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="flex gap-1 glass rounded-xl p-1 mb-5">
        {[
          { key: 'products', label: 'Bond Packages' },
          { key: 'mybonds', label: 'My Bonds' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === t.key
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </motion.div>

      {/* ── PRODUCTS TAB ── */}
      {tab === 'products' && (
        <div className="space-y-4">
          {INVEST_PRODUCTS.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-2xl border border-border overflow-hidden"
            >
              {/* Card body */}
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <BondIcon level={product.level} color={product.color} shadow={product.shadow} />

                  <div className="flex-1 min-w-0">
                    {/* Name + badge */}
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-sm">{product.name}</p>
                      {product.badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-gradient-to-r ${product.color} text-white shrink-0`}>
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-3 leading-snug">{product.subtitle}</p>

                    {/* Stats 2×2 */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Price</p>
                        <p className="text-xs font-bold">{formatUGX(product.price)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Daily Income</p>
                        <p className="text-xs font-bold text-emerald-400">{formatUGX(product.daily_income)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Cycle</p>
                        <p className="text-xs font-bold">{product.term} days</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Total Return</p>
                        <p className="text-xs font-bold text-amber-400">{formatUGX(product.total_income)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buy button — full-width strip */}
              <button
                onClick={() => setSelected(product)}
                className={`w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r ${product.color} text-white text-sm font-bold hover:opacity-90 transition-opacity`}
              >
                Invest Now <ChevronRight size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── MY BONDS TAB ── */}
      {tab === 'mybonds' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 space-y-5 text-center"
        >
          {/* Empty state illustration */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Layers size={32} className="text-emerald-500/60" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground">0</span>
            </div>
          </div>

          <div>
            <p className="font-bold text-base">No active bonds</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-[240px]">
              Purchase a bond package to start earning passive daily income.
            </p>
          </div>

          {/* How it works mini guide */}
          <div className="w-full glass rounded-2xl p-4 text-left space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">How it works</p>
            {[
              { icon: Wallet, title: 'Choose a package', desc: 'Pick any bond tier that fits your budget — from UGX 25K up to UGX 1M.' },
              { icon: Clock, title: 'Earn for 360 days', desc: 'Your daily income hits your wallet automatically every day.' },
              { icon: TrendingUp, title: 'Upgrade anytime', desc: 'Buy multiple packages or upgrade to higher tiers for more daily income.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold">{title}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setTab('products')}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/30"
          >
            Browse Bond Packages
          </button>
        </motion.div>
      )}

      {/* ── CONFIRM MODAL ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 pb-24 sm:pb-4 bg-navy/70 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm glass rounded-2xl overflow-hidden"
            >
              {/* Modal header strip */}
              <div className={`bg-gradient-to-r ${selected.color} px-5 py-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <BondIcon level={selected.level} color="from-white/20 to-white/10" shadow="" />
                  <div>
                    <p className="font-bold text-white text-base">{selected.name}</p>
                    <p className="text-[11px] text-white/70">{selected.subtitle}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-white/70 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Breakdown */}
                <div className="bg-muted/40 rounded-xl p-4 space-y-2.5 text-sm">
                  {[
                    { label: 'Investment Required', value: formatUGX(selected.price) },
                    { label: 'Daily Income', value: formatUGX(selected.daily_income) },
                    { label: 'Cycle Duration', value: `${selected.term} days` },
                    { label: 'Total Return', value: formatUGX(selected.total_income), highlight: true },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className={`font-bold ${row.highlight ? 'text-amber-400' : ''}`}>{row.value}</span>
                    </div>
                  ))}
                  <div className="h-px bg-border" />
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>ROI per day</span>
                    <span className="font-semibold text-emerald-400">
                      {((selected.daily_income / selected.price) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Info note */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-400">
                  <Info size={13} className="shrink-0 mt-0.5" />
                  <p>Your daily income will be credited to your wallet automatically once the investment is active.</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelected(null)}
                    className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-muted/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    className={`flex-1 py-3 rounded-xl bg-gradient-to-r ${selected.color} text-white text-sm font-bold shadow-lg hover:opacity-90 transition-opacity`}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
