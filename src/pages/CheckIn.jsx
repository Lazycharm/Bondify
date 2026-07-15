import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { formatUGX } from '@/lib/vipData';
import { playSound } from '@/lib/sound';
import { fireConfetti } from '@/components/ui/Celebration';
import { getCheckInData, doCheckIn, canCheckIn, msUntilNextCheckIn, CHECKIN_BONUS } from '@/lib/checkInStore';
import { useAuth } from '@/lib/AuthContext';
import { uploadWalletData } from '@/lib/supabase_ops';

export default function CheckIn() {
  const { user } = useAuth();
  const [data, setData] = useState(getCheckInData);
  const [countdown, setCountdown] = useState('');
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const [canCheck, setCanCheck] = useState(canCheckIn);

  useEffect(() => {
    const tick = () => {
      const can = canCheckIn();
      setCanCheck(can);
      if (!can) {
        const ms = msUntilNextCheckIn();
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        setCountdown(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  function handleCheckIn() {
    const earned = doCheckIn(user?.id);
    if (!earned) return;
    const updated = getCheckInData();
    setData(updated);
    setCanCheck(false);
    setJustCheckedIn(true);
    playSound('success');
    fireConfetti({ particleCount: 60, spread: 80 });
    if (user?.id) uploadWalletData(user.id); // sync gift credits to Supabase
    setTimeout(() => setJustCheckedIn(false), 2500);
  }

  // Calendar: last 35 days (5 rows × 7 cols)
  const today = new Date();
  const checkedDates = new Set((data.history || []).map((d) => new Date(d).toDateString()));
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (34 - i));
    return d;
  });

  const daysCount = data.history?.length || 0;

  return (
    <div className="max-w-lg mx-auto space-y-5 pb-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Daily Check-in</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Check in every day and earn UGX {CHECKIN_BONUS.toLocaleString()} bonus per check-in.
        </p>
      </motion.div>

      {/* Streak card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <GlassCard hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Check-ins</p>
              <p className="text-3xl font-black text-emerald-400">{daysCount} days</p>
              <p className="text-xs text-muted-foreground mt-1">
                Each check-in credits {formatUGX(CHECKIN_BONUS)} instantly to your wallet
              </p>
            </div>
            <div className="text-4xl select-none">🔥</div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Check-in button */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard hover={false} className="py-8 text-center">
          <AnimatePresence mode="wait">
            {justCheckedIn ? (
              <motion.div
                key="done"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <motion.div
                  animate={{ rotate: [0, 20, -20, 0] }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center"
                >
                  <CheckCircle2 size={32} className="text-emerald-400" />
                </motion.div>
                <p className="font-bold text-emerald-400 text-lg">+{formatUGX(CHECKIN_BONUS)} added!</p>
                <p className="text-xs text-muted-foreground">Come back in 24 hours</p>
              </motion.div>
            ) : canCheck ? (
              <motion.div
                key="check"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-6xl select-none"
                >
                  📅
                </motion.div>
                <p className="text-sm font-semibold text-muted-foreground">Ready to check in!</p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={handleCheckIn}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-xl shadow-emerald-500/30"
                >
                  Check In — Earn {formatUGX(CHECKIN_BONUS)}
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="text-5xl select-none">✅</div>
                <p className="font-semibold">Already checked in today!</p>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/50 border border-border">
                  <Clock size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Next check-in in{' '}
                    <span className="font-bold text-foreground font-mono">{countdown}</span>
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>

      {/* Calendar grid */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-emerald-400" />
            <h3 className="font-semibold text-sm">Last 35 Days</h3>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="text-center text-[9px] text-muted-foreground font-bold pb-1">{d}</div>
            ))}
            {calendarDays.map((d, i) => {
              const checked = checkedDates.has(d.toDateString());
              const isToday = d.toDateString() === today.toDateString();
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.008 }}
                  className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold border transition-colors ${
                    checked
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-sm shadow-emerald-500/40'
                      : isToday
                      ? 'border-emerald-500/60 text-emerald-400 bg-emerald-500/10'
                      : 'border-border/60 text-muted-foreground/40'
                  }`}
                >
                  {d.getDate()}
                </motion.div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Checked in
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-border inline-block" /> Missed
            </span>
          </div>
        </GlassCard>
      </motion.div>

      {/* Info rules */}
      <div className="space-y-2 px-1">
        {[
          `Daily check-in reward: ${formatUGX(CHECKIN_BONUS)} — credited instantly to wallet`,
          'Check in once per 24 hours and timer resets automatically',
          'Rewards are added directly to your wallet balance — no withdrawal step needed',
        ].map((t) => (
          <div key={t} className="flex items-start gap-2 text-xs text-muted-foreground">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
