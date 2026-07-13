import { motion } from 'framer-motion';
import { Award, Lock, Star, Zap, Crown, Users, Calendar, TrendingUp } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import CountUp from '@/components/ui/count-up';
import { formatUGX } from '@/lib/vipData';

const ACHIEVEMENTS = [
  { name: 'Daily Investor', desc: 'Invest for 7 consecutive days', icon: Calendar, tier: 'bronze', earned: true, progress: 100 },
  { name: 'VIP Upgrade', desc: 'Reach VIP2', icon: Crown, tier: 'silver', earned: true, progress: 100 },
  { name: 'Task Master', desc: 'Complete all daily tasks', icon: Zap, tier: 'silver', earned: true, progress: 100 },
  { name: 'Referral Champion', desc: 'Refer 50+ members', icon: Users, tier: 'gold', earned: false, progress: 68 },
  { name: '30-Day Streak', desc: 'Check in for 30 days', icon: Star, tier: 'gold', earned: false, progress: 45 },
  { name: '100 Tasks Completed', desc: 'Finish 100 bond tasks', icon: TrendingUp, tier: 'platinum', earned: false, progress: 32 },
  { name: 'Million Club', desc: 'Invest over UGX 1,000,000', icon: Crown, tier: 'platinum', earned: false, progress: 15 },
];

const TIER_STYLES = {
  bronze: { ring: 'ring-amber-700/30', bg: 'from-amber-700 to-amber-800', text: 'text-amber-700' },
  silver: { ring: 'ring-slate-400/30', bg: 'from-slate-300 to-slate-400', text: 'text-slate-500' },
  gold: { ring: 'ring-amber-400/40', bg: 'from-yellow-400 to-amber-500', text: 'text-amber-500' },
  platinum: { ring: 'ring-cyan-400/40', bg: 'from-cyan-300 to-teal-400', text: 'text-cyan-500' },
};

export default function Achievements() {
  const earned = ACHIEVEMENTS.filter((a) => a.earned).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Achievements</h1>
        <p className="text-muted-foreground text-sm">{earned} of {ACHIEVEMENTS.length} badges earned.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((a, i) => {
          const tier = TIER_STYLES[a.tier];
          return (
            <motion.div key={a.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <GlassCard glow={a.earned} glowColor="gold" hover className={`h-full ${!a.earned ? 'opacity-80' : `ring-2 ${tier.ring}`}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tier.bg} flex items-center justify-center shadow-lg ${!a.earned ? 'grayscale opacity-60' : ''}`}>
                    {a.earned ? <a.icon className="text-white" size={24} /> : <Lock className="text-white" size={22} />}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize bg-muted/60 ${tier.text}`}>{a.tier}</span>
                </div>
                <h3 className="font-bold">{a.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{a.desc}</p>
                {a.earned ? (
                  <div className="flex items-center gap-1.5 text-sm text-emerald-500 font-medium">
                    <Award size={14} /> Earned
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span><CountUp value={a.progress} suffix="%" /></span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${a.progress}%` }} transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500" />
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}