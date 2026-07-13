import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, Clock } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import MagneticButton from '@/components/ui/MagneticButton';
import CountUp from '@/components/ui/count-up';
import { CelebrationOverlay, fireConfetti } from '@/components/ui/Celebration';
import { playSound } from '@/lib/sound';

export default function DailyGift() {
  const [opened, setOpened] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [countdown, setCountdown] = useState('23:45:12');

  useEffect(() => {
    const tick = setInterval(() => {
      const target = new Date();
      target.setHours(24, 0, 0, 0);
      const diff = target - new Date();
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setCountdown(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const openChest = () => {
    if (opened) return;
    playSound('reward');
    fireConfetti({ particleCount: 120, spread: 100 });
    setOpened(true);
    setCelebrate(true);
  };

  return (
    <div className="space-y-6">
      <CelebrationOverlay
        show={celebrate}
        title="You found a gift!"
        subtitle="Gift code TREASURY100 · UGX 5,000 added to bonus wallet"
        onClose={() => setCelebrate(false)}
        autoDismiss={3500}
      />

      <div>
        <h1 className="text-2xl font-bold">Daily Gift</h1>
        <p className="text-muted-foreground text-sm">Open your treasure chest once every 24 hours.</p>
      </div>

      <GlassCard hover={false} className="text-center py-12">
        <div className="flex justify-center mb-6">
          <motion.button
            onClick={openChest}
            disabled={opened}
            whileHover={!opened ? { scale: 1.05 } : undefined}
            whileTap={!opened ? { scale: 0.95 } : undefined}
            className="relative"
          >
            <motion.div
              animate={opened ? { rotate: [0, -15, 0] } : { y: [0, -8, 0] }}
              transition={{ duration: opened ? 0.5 : 2.5, repeat: opened ? 0 : Infinity }}
              className="text-8xl select-none"
            >
              {opened ? '🎁' : '📦'}
            </motion.div>
            {opened && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="text-amber-400" size={28} />
              </motion.div>
            )}
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {opened ? (
            <motion.div
              key="opened"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-lg font-semibold text-gradient-gold">Gift Code: TREASURY100</p>
              <p className="text-sm text-muted-foreground mt-1">UGX 5,000 added to your bonus wallet</p>
              <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
                <Clock size={14} /> Next gift in {countdown}
              </p>
            </motion.div>
          ) : (
            <motion.div key="closed" exit={{ opacity: 0 }}>
              <p className="text-lg font-semibold mb-4">Tap the chest to reveal your gift</p>
              <MagneticButton
                onClick={openChest}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-semibold flex items-center gap-2 mx-auto"
              >
                <Gift size={18} /> Open Treasure Chest
              </MagneticButton>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      <GlassCard hover={false}>
        <h3 className="font-semibold mb-3">Gift History</h3>
        <div className="space-y-2 text-sm">
          {[
            { date: 'Yesterday', code: 'BOND50', amount: 2500 },
            { date: '2 days ago', code: 'WELCOME10', amount: 5000 },
            { date: '3 days ago', code: 'STREAK30', amount: 3000 },
          ].map((g) => (
            <div key={g.code} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="font-medium">{g.code}</p>
                <p className="text-xs text-muted-foreground">{g.date}</p>
              </div>
              <span className="font-semibold text-emerald-500">
                <CountUp value={g.amount} prefix="UGX " />
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}