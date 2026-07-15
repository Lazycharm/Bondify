import { motion } from 'framer-motion';
import { Lock, Check } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { VIP_LEVELS, formatUGXShort } from '@/lib/vipData';

export default function VipLevels() {
  const currentLevel = 2;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl">
        <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80" alt="" className="w-full h-32 sm:h-40 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-emerald-900/70 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center p-6">
          <h1 className="text-2xl font-bold text-white">VIP Levels</h1>
          <p className="text-white/70 text-sm">Progress through 10 tiers. Bigger rewards at every step.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {VIP_LEVELS.map((vip, i) => {
          const locked = vip.level > currentLevel;
          const isCurrent = vip.level === currentLevel;
          return (
            <motion.div
              key={vip.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <GlassCard
                glow={isCurrent}
                glowColor={isCurrent ? 'gold' : 'emerald'}
                className={`h-full ${locked ? 'opacity-70' : ''} ${isCurrent ? 'ring-2 ring-amber-400/50' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${vip.color} flex items-center justify-center font-bold text-white text-xl shadow-lg ${locked ? 'blur-[2px]' : ''}`}>
                    {locked ? <Lock size={20} /> : vip.level}
                  </div>
                  {isCurrent && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-400/20 text-amber-500">CURRENT</span>
                  )}
                  {vip.level < currentLevel && (
                    <Check size={18} className="text-emerald-500" />
                  )}
                </div>
                <h3 className="font-bold text-lg">{vip.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">VIP {vip.level}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min. Investment</span>
                    <span className="font-semibold">{vip.level === 10 ? 'Custom' : formatUGXShort(vip.min_investment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily Tasks</span>
                    <span className="font-semibold">{vip.daily_tasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily Earnings</span>
                    <span className="font-semibold text-emerald-500">
                      {formatUGXShort(vip.daily_earnings_min)} – {formatUGXShort(vip.daily_earnings_max)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Perks</p>
                  <div className="flex flex-wrap gap-1">
                    {vip.perks.map((p) => (
                      <span key={p} className="text-[11px] px-2 py-0.5 rounded-full bg-muted/60">{p}</span>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}