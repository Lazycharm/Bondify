import { motion } from 'framer-motion';
import { Copy, QrCode, Share2, Trophy, Users } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import MagneticButton from '@/components/ui/MagneticButton';
import CountUp from '@/components/ui/count-up';
import { formatUGX } from '@/lib/vipData';
import { playSound } from '@/lib/sound';

const LEVELS = [
  { level: 1, rate: 35, color: 'from-emerald-500 to-teal-600', count: 12, earnings: 21000 },
  { level: 2, rate: 2, color: 'from-sky-400 to-blue-500', count: 34, earnings: 1360 },
  { level: 3, rate: 1, color: 'from-violet-400 to-purple-500', count: 89, earnings: 890 },
];

const LEADERBOARD = [
  { rank: 1, name: 'Grace K.', referrals: 248, earnings: 1250000 },
  { rank: 2, name: 'David M.', referrals: 201, earnings: 980000 },
  { rank: 3, name: 'Alice W.', referrals: 178, earnings: 760000 },
  { rank: 4, name: 'You', referrals: 135, earnings: 45000, isYou: true },
  { rank: 5, name: 'Peter O.', referrals: 98, earnings: 42000 },
];

export default function Referrals() {
  const copyLink = () => {
    navigator.clipboard?.writeText('https://treasurybonds.app/r/USER123');
    playSound('click');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Referrals</h1>
        <p className="text-muted-foreground text-sm">Earn from 3 levels of referrals.</p>
      </div>

      {/* Referral link */}
      <GlassCard glow glowColor="emerald">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-24 h-24 rounded-2xl bg-white p-2 flex items-center justify-center shrink-0">
            <QrCode size={80} className="text-navy" />
          </div>
          <div className="flex-1 w-full">
            <p className="text-sm text-muted-foreground mb-1">Your referral link</p>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
              <code className="text-sm flex-1 truncate">https://treasurybonds.app/r/USER123</code>
              <button onClick={copyLink} className="p-2 rounded-lg glass hover:scale-105 transition-transform">
                <Copy size={16} />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              {['WhatsApp', 'Facebook', 'Telegram'].map((s) => (
                <MagneticButton key={s} onClick={() => playSound('click')} strength={0.15} className="px-3 py-1.5 rounded-lg glass text-xs font-medium flex items-center gap-1.5">
                  <Share2 size={12} /> {s}
                </MagneticButton>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Commission levels */}
      <div className="grid sm:grid-cols-3 gap-4">
        {LEVELS.map((l, i) => (
          <motion.div key={l.level} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <GlassCard glow hover className="text-center">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${l.color} flex items-center justify-center mx-auto mb-3 font-bold text-white text-lg shadow-lg`}>
                L{l.level}
              </div>
              <p className="text-3xl font-bold text-gradient-emerald">{l.rate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Commission rate</p>
              <div className="mt-3 pt-3 border-t border-border text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Referrals</span><span className="font-medium">{l.count}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Earnings</span><span className="font-medium text-emerald-500"><CountUp value={l.earnings} prefix="UGX " /></span></div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Leaderboard */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="text-amber-500" size={20} />
          <h3 className="font-semibold">Top Referrers — This Month</h3>
        </div>
        <div className="space-y-2">
          {LEADERBOARD.map((u) => (
            <div key={u.rank} className={`flex items-center gap-3 p-3 rounded-xl ${u.isYou ? 'bg-emerald-500/10 ring-1 ring-emerald-500/30' : 'bg-muted/30'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${u.rank <= 3 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                {u.rank}
              </span>
              <div className="flex-1">
                <p className="font-medium text-sm">{u.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Users size={11} /> {u.referrals} referrals</p>
              </div>
              <span className="font-semibold text-emerald-500 text-sm">{formatUGX(u.earnings)}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}