import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator as CalcIcon, TrendingUp, Clock, Coins, Crown, RotateCcw } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import CountUp from '@/components/ui/count-up';
import { VIP_LEVELS, formatUGX, formatUGXShort, getBondsPerDay } from '@/lib/vipData';
import { getWalletBalance } from '@/lib/depositStore';
import { playSound } from '@/lib/sound';

const DURATION_OPTIONS = [91, 182, 364, 730, 1095, 1825];

function getCurrentVipLevel(balance) {
  const sorted = [...VIP_LEVELS].sort((a, b) => b.min_investment - a.min_investment);
  return (sorted.find((v) => balance >= v.min_investment) ?? VIP_LEVELS[0]).level;
}

export default function Calculator() {
  const [amount, setAmount] = useState(100000);
  const [duration, setDuration] = useState(364);
  const [vipLevel, setVipLevel] = useState(1);

  // Pre-populate with user's actual VIP level on mount
  useEffect(() => {
    const balance = getWalletBalance();
    const level = getCurrentVipLevel(balance);
    setVipLevel(level);
    if (balance >= VIP_LEVELS[level - 1]?.min_investment) {
      setAmount(VIP_LEVELS[level - 1].min_investment);
    }
  }, []);

  const vip = VIP_LEVELS[vipLevel - 1];
  const bondsPerDay = getBondsPerDay(vipLevel);

  const results = useMemo(() => {
    if (!vip || amount <= 0) return { projectedReturn: 0, totalProfit: 0, dailyEarning: 0, roi: '0' };
    // Average daily earnings as a % of VIP tier midpoint daily earnings
    const avgDaily = (vip.daily_earnings_min + vip.daily_earnings_max) / 2;
    const totalProfit = avgDaily * duration;
    const projectedReturn = amount + totalProfit;
    const dailyEarning = avgDaily;
    const roi = ((totalProfit / amount) * 100).toFixed(1);
    return { projectedReturn, totalProfit, dailyEarning, roi };
  }, [amount, duration, vip]);

  const reset = () => {
    setAmount(100000);
    setDuration(364);
    setVipLevel(1);
    playSound('click');
  };

  const quickAmounts = [50000, 100000, 250000, 500000, 1000000];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl" style={{ height: 160 }}>
        <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-emerald-900/70 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center p-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalcIcon size={22} /> Bond Calculator
          </h1>
          <p className="text-white/70 text-sm mt-1">Estimate your projected daily earnings based on VIP tier.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <GlassCard hover={false} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">Parameters</h2>
            <button onClick={reset} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw size={13} /> Reset
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Deposit Amount (UGX)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">UGX</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full pl-14 pr-4 py-3 rounded-xl bg-background/60 border border-border text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {quickAmounts.map((a) => (
                <button
                  key={a}
                  onClick={() => { setAmount(a); playSound('click'); }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    amount === a ? 'bg-emerald-500 text-white' : 'glass text-muted-foreground hover:text-foreground'
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
                  className={`py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    duration === d ? 'bg-emerald-500 text-white' : 'glass text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {d < 365 ? `${d} days` : `${(d / 365).toFixed(d % 365 === 0 ? 0 : 1)} yr`}
                </button>
              ))}
            </div>
          </div>

          {/* VIP Level slider */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1 block">
              <Crown size={13} /> VIP Tier
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={vipLevel}
              onChange={(e) => { setVipLevel(parseInt(e.target.value)); playSound('click'); }}
              className="w-full accent-emerald-500"
            />
            <div className="flex items-center justify-between mt-2">
              <span className={`text-sm font-bold bg-gradient-to-r ${vip.color} bg-clip-text text-transparent`}>
                L{vip.level} · {vip.name}
              </span>
              <span className="text-xs text-muted-foreground">{bondsPerDay} bonds/day</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Daily earnings: {formatUGXShort(vip.daily_earnings_min)} – {formatUGXShort(vip.daily_earnings_max)}
            </p>
            <p className="text-xs text-muted-foreground">
              Min. deposit: {formatUGX(vip.min_investment)}
            </p>
          </div>
        </GlassCard>

        {/* Results */}
        <div className="space-y-4">
          <motion.div key={`${amount}-${duration}-${vipLevel}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <GlassCard glow hover={false} className="text-center">
              <p className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1">
                <TrendingUp size={14} /> Projected Total Return
              </p>
              <p className="text-4xl font-bold text-emerald-400">
                <CountUp end={results.projectedReturn} format={(n) => formatUGX(Math.round(n)).replace('UGX ', '')} duration={0.8} prefix="UGX " />
              </p>
              <p className="text-sm text-amber-500 font-semibold mt-2">+{results.roi}% ROI over {duration} days</p>
            </GlassCard>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <GlassCard>
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                <Coins size={13} /> Total Profit
              </div>
              <p className="text-xl font-bold text-emerald-500">
                <CountUp end={results.totalProfit} format={(n) => formatUGX(Math.round(n)).replace('UGX ', '')} duration={0.8} prefix="UGX " />
              </p>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                <Clock size={13} /> Avg. Daily
              </div>
              <p className="text-xl font-bold text-amber-500">
                <CountUp end={results.dailyEarning} format={(n) => formatUGX(Math.round(n)).replace('UGX ', '')} duration={0.8} prefix="UGX " />
              </p>
            </GlassCard>
          </div>

          {/* Growth breakdown */}
          <GlassCard hover={false}>
            <h3 className="text-sm font-semibold mb-4">Growth Breakdown</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Principal</span>
                  <span className="font-medium">{formatUGX(amount)}</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-700"
                    style={{ width: results.projectedReturn > 0 ? `${(amount / results.projectedReturn) * 100}%` : '100%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Profit</span>
                  <span className="font-medium text-emerald-500">+{formatUGX(Math.round(results.totalProfit))}</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                    style={{ width: results.projectedReturn > 0 ? `${(results.totalProfit / results.projectedReturn) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deposit</span>
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
                <span className="text-muted-foreground">Bonds / Day</span>
                <span className="font-medium">{bondsPerDay}</span>
              </div>
            </div>
          </GlassCard>

          <p className="text-xs text-muted-foreground text-center px-4 leading-relaxed">
            * Projections use average VIP tier daily earnings and assume all daily tasks are completed. Actual results vary.
          </p>
        </div>
      </div>
    </div>
  );
}
