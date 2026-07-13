import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator as CalcIcon, TrendingUp, Clock, Coins, Crown, RotateCcw } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import CountUp from '@/components/ui/count-up';
import { VIP_LEVELS, formatUGX, formatUGXShort } from '@/lib/vipData';
import { playSound } from '@/lib/sound';

const DURATION_OPTIONS = [91, 182, 364, 730, 1095, 1825];

export default function Calculator() {
  const [amount, setAmount] = useState(100000);
  const [duration, setDuration] = useState(364);
  const [vipLevel, setVipLevel] = useState(2);

  const vip = VIP_LEVELS[vipLevel - 1];

  const results = useMemo(() => {
    const dailyRate = (vip.daily_earnings_min + vip.daily_earnings_max) / 2 / 100; // % of investment per day
    const baseReturn = amount * dailyRate * (duration / 30); // monthly compounding approximation
    const projectedReturn = amount + baseReturn;
    const totalProfit = projectedReturn - amount;
    const dailyEarning = totalProfit / duration;
    const roi = ((totalProfit / amount) * 100).toFixed(1);
    return { projectedReturn, totalProfit, dailyEarning, roi };
  }, [amount, duration, vip]);

  const reset = () => {
    setAmount(100000);
    setDuration(364);
    setVipLevel(2);
    playSound('click');
  };

  const quickAmounts = [50000, 100000, 250000, 500000, 1000000];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl">
        <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80" alt="" className="w-full h-32 sm:h-40 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-emerald-900/70 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center p-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalcIcon size={24} /> Bond Calculator
          </h1>
          <p className="text-white/70 text-sm">Estimate your projected growth and rewards based on your VIP tier.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <GlassCard className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">Investment Parameters</h2>
            <button onClick={reset} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Investment Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">UGX</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full pl-14 pr-4 py-3 rounded-xl bg-background/60 border border-border text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {quickAmounts.map((a) => (
                <button
                  key={a}
                  onClick={() => { setAmount(a); playSound('click'); }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    amount === a ? 'bg-primary text-primary-foreground' : 'glass text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {formatUGXShort(a)}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Duration</label>
            <div className="grid grid-cols-3 gap-2">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => { setDuration(d); playSound('click'); }}
                  className={`py-2 rounded-xl text-xs font-medium transition-colors ${
                    duration === d ? 'bg-primary text-primary-foreground' : 'glass text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {d < 365 ? `${d}d` : `${(d / 365).toFixed(d % 365 === 0 ? 0 : 1)}y`}
                </button>
              ))}
            </div>
          </div>

          {/* VIP Level */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
              <Crown size={14} /> VIP Tier
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min={1}
                max={10}
                value={vipLevel}
                onChange={(e) => setVipLevel(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold bg-gradient-to-r ${vip.color} bg-clip-text text-transparent`}>
                  L{vip.level} · {vip.name}
                </span>
                <span className="text-xs text-muted-foreground">{vip.daily_tasks} daily tasks</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Daily earnings: {formatUGXShort(vip.daily_earnings_min)} – {formatUGXShort(vip.daily_earnings_max)}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Results */}
        <div className="space-y-4">
          {/* Projected return */}
          <motion.div key={`${amount}-${duration}-${vipLevel}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <GlassCard glow className="p-6 text-center">
              <p className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1">
                <TrendingUp size={14} /> Projected Total Return
              </p>
              <p className="text-4xl font-bold text-gradient-emerald">
                <CountUp end={results.projectedReturn} format={(n) => formatUGX(n).replace('UGX ', '')} duration={1} prefix="UGX " />
              </p>
              <p className="text-sm text-amber-500 font-semibold mt-2">+{results.roi}% ROI</p>
            </GlassCard>
          </motion.div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                <Coins size={14} /> Total Profit
              </div>
              <p className="text-xl font-bold text-emerald-500">
                <CountUp end={results.totalProfit} format={(n) => formatUGX(n).replace('UGX ', '')} duration={1} prefix="UGX " />
              </p>
            </GlassCard>
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                <Clock size={14} /> Daily Earning
              </div>
              <p className="text-xl font-bold text-amber-500">
                <CountUp end={results.dailyEarning} format={(n) => formatUGX(n).replace('UGX ', '')} duration={1} prefix="UGX " />
              </p>
            </GlassCard>
          </div>

          {/* Growth visualization */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-semibold mb-4">Growth Breakdown</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Principal</span>
                  <span className="font-medium">{formatUGX(amount)}</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky-400 to-blue-500" style={{ width: `${(amount / results.projectedReturn) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Profit</span>
                  <span className="font-medium text-emerald-500">+{formatUGX(results.totalProfit)}</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${(results.totalProfit / results.projectedReturn) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Investment Amount</span>
                <span className="font-medium">{formatUGX(amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{duration} days ({(duration / 30).toFixed(1)} months)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VIP Tier</span>
                <span className="font-medium">L{vip.level} · {vip.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Tasks</span>
                <span className="font-medium">{vip.daily_tasks} / day</span>
              </div>
            </div>
          </GlassCard>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center px-4">
            * Projections are estimates based on average VIP tier earnings and do not guarantee actual returns.
            Actual results may vary based on market conditions and task completion.
          </p>
        </div>
      </div>
    </div>
  );
}