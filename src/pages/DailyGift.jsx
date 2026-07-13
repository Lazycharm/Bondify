import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, Clock } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import MagneticButton from '@/components/ui/MagneticButton';
import CountUp from '@/components/ui/count-up';
import { CelebrationOverlay, fireConfetti } from '@/components/ui/Celebration';
import { formatUGX } from '@/lib/vipData';
import { addGiftCredit } from '@/lib/depositStore';
import { useAuth } from '@/lib/AuthContext';
import { playSound } from '@/lib/sound';

const GIFT_KEY = 'bondify_daily_gift';
const REWARDS = [500, 1000, 1500, 2000, 2500, 3000];

function loadGiftState() {
  try { return JSON.parse(localStorage.getItem(GIFT_KEY) || '{"history":[]}'); }
  catch { return { history: [] }; }
}

function claimedToday(state) {
  return state.lastClaimed === new Date().toDateString();
}

function randomReward() {
  return REWARDS[Math.floor(Math.random() * REWARDS.length)];
}

export default function DailyGift() {
  const { user } = useAuth();
  const [giftState, setGiftState] = useState(loadGiftState);
  const [celebrate, setCelebrate] = useState(false);
  const [thisReward, setThisReward] = useState(0);
  const [countdown, setCountdown] = useState('');

  const alreadyClaimed = claimedToday(giftState);

  useEffect(() => {
    const tick = () => {
      const target = new Date();
      target.setHours(24, 0, 0, 0);
      const diff = target - new Date();
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setCountdown(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const openChest = () => {
    if (alreadyClaimed) return;
    const reward = randomReward();
    addGiftCredit(reward);

    const updated = {
      lastClaimed: new Date().toDateString(),
      history: [{ date: new Date().toISOString(), amount: reward }, ...(giftState.history || [])].slice(0, 30),
    };
    localStorage.setItem(GIFT_KEY, JSON.stringify(updated));
    setGiftState(updated);
    setThisReward(reward);
    playSound('reward');
    fireConfetti({ particleCount: 120, spread: 100 });
    setCelebrate(true);
  };

  return (
    <div className="space-y-6">
      <CelebrationOverlay
        show={celebrate}
        title="You found a gift!"
        subtitle={`${formatUGX(thisReward)} added to your wallet`}
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
            disabled={alreadyClaimed}
            whileHover={!alreadyClaimed ? { scale: 1.05 } : undefined}
            whileTap={!alreadyClaimed ? { scale: 0.95 } : undefined}
          >
            <motion.div
              animate={alreadyClaimed ? { rotate: [0, -15, 0] } : { y: [0, -8, 0] }}
              transition={{ duration: alreadyClaimed ? 0.5 : 2.5, repeat: alreadyClaimed ? 0 : Infinity }}
              className="text-8xl select-none"
            >
              {alreadyClaimed ? '🎁' : '📦'}
            </motion.div>
            {alreadyClaimed && (
              <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="absolute -top-2 -right-2">
                <Sparkles className="text-amber-400" size={28} />
              </motion.div>
            )}
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {alreadyClaimed ? (
            <motion.div key="opened" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-lg font-semibold text-emerald-500">
                {formatUGX(giftState.history?.[0]?.amount ?? 0)} claimed today!
              </p>
              <p className="text-sm text-muted-foreground mt-1">Come back tomorrow for your next gift.</p>
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
        {giftState.history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No gifts claimed yet. Open your first chest!</p>
        ) : (
          <div className="space-y-2 text-sm">
            {giftState.history.map((g, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium">Daily reward</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(g.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="font-semibold text-emerald-500">
                  <CountUp value={g.amount} prefix="UGX " />
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
