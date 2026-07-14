import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Clock, Sparkles, CheckCircle2, Star } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { CelebrationOverlay, fireConfetti } from '@/components/ui/Celebration';
import { formatUGX } from '@/lib/vipData';
import { addGiftCredit } from '@/lib/depositStore';
import { getPaymentSettings } from '@/lib/paymentSettings';
import { playSound } from '@/lib/sound';

const GIFT_KEY = 'bondify_gift_v2';

// Gift window: 15:30 – 16:00 daily
function getWindowStatus() {
  const now = new Date();
  const open = new Date(now); open.setHours(15, 30, 0, 0);
  const close = new Date(now); close.setHours(16, 0, 0, 0);

  if (now >= open && now < close) {
    return { status: 'open', msUntil: close - now };
  }
  const nextOpen = new Date(open);
  if (now >= close) nextOpen.setDate(nextOpen.getDate() + 1);
  return { status: now < open ? 'before' : 'after', msUntil: nextOpen - now };
}

function loadState() {
  try { return JSON.parse(localStorage.getItem(GIFT_KEY) || '{"lastClaimed":null,"history":[]}'); }
  catch { return { lastClaimed: null, history: [] }; }
}

function claimedToday(state) {
  return state.lastClaimed === new Date().toDateString();
}

function fmtMs(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function DailyGift() {
  const [giftState, setGiftState] = useState(loadState);
  const [ws, setWs] = useState(getWindowStatus);
  const [countdown, setCountdown] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | shaking | opening | revealed
  const [earnedAmount, setEarnedAmount] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const phaseRef = useRef('idle');

  const alreadyClaimed = claimedToday(giftState);

  useEffect(() => {
    const tick = () => {
      const w = getWindowStatus();
      setWs(w);
      setCountdown(fmtMs(w.msUntil));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  async function handleRedeem() {
    if (alreadyClaimed || ws.status !== 'open' || phaseRef.current !== 'idle') return;

    const settings = getPaymentSettings();
    const amount = Math.max(0, parseInt(settings.daily_gift_amount || '1000', 10) || 1000);
    if (amount === 0) return;

    phaseRef.current = 'shaking';
    setPhase('shaking');
    playSound('click');
    await delay(500);

    phaseRef.current = 'opening';
    setPhase('opening');
    await delay(600);

    phaseRef.current = 'revealed';
    setPhase('revealed');
    setEarnedAmount(amount);

    addGiftCredit(amount);
    const updated = {
      lastClaimed: new Date().toDateString(),
      history: [{ date: new Date().toISOString(), amount }, ...(giftState.history || [])].slice(0, 30),
    };
    localStorage.setItem(GIFT_KEY, JSON.stringify(updated));
    setGiftState(updated);

    playSound('reward');
    fireConfetti({ particleCount: 140, spread: 120 });
    setCelebrate(true);
  }

  const isOpen = ws.status === 'open';

  return (
    <div className="max-w-lg mx-auto space-y-5 pb-10">
      <CelebrationOverlay
        show={celebrate}
        title="🎁 Gift Unlocked!"
        subtitle={`+${formatUGX(earnedAmount)} added to your wallet`}
        onClose={() => setCelebrate(false)}
        autoDismiss={3500}
      />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Daily Gift</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Open your gift box during the daily gift window.</p>
      </motion.div>

      {/* Window status banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`rounded-2xl p-4 flex items-center gap-3 border ${
          isOpen
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-amber-500/10 border-amber-500/30'
        }`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isOpen ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
          {isOpen ? <Gift size={20} className="text-emerald-400" /> : <Clock size={20} className="text-amber-400" />}
        </div>
        <div className="flex-1">
          {isOpen ? (
            <>
              <p className="text-sm font-bold text-emerald-400">Gift window is OPEN!</p>
              <p className="text-xs text-muted-foreground">Closes at 4:00 PM — grab it in <span className="font-mono font-bold text-emerald-400">{countdown}</span></p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-amber-400">Gift window: 3:30 – 4:00 PM daily</p>
              <p className="text-xs text-muted-foreground">Opens in <span className="font-mono font-bold text-amber-400">{countdown}</span></p>
            </>
          )}
        </div>
      </motion.div>

      {/* Gift box */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard hover={false} className="py-10 text-center relative overflow-hidden">
          {/* Ambient particles when open & not yet claimed */}
          {isOpen && !alreadyClaimed && phase === 'idle' && (
            <>
              {['⭐', '✨', '💫', '🌟', '⭐'].map((em, i) => (
                <motion.span
                  key={i}
                  className="absolute text-base pointer-events-none select-none"
                  style={{ left: `${15 + i * 17}%` }}
                  initial={{ opacity: 0, y: '90%' }}
                  animate={{ opacity: [0, 0.9, 0], y: '-10%' }}
                  transition={{ duration: 2.5, delay: i * 0.5, repeat: Infinity, repeatDelay: 1.5 }}
                >
                  {em}
                </motion.span>
              ))}
            </>
          )}

          {/* Gift box visual */}
          <div className="relative w-36 mx-auto mb-6" style={{ height: 120 }}>
            {/* Lid */}
            <motion.div
              className="absolute left-0 right-0 z-20"
              animate={phase === 'opening' || phase === 'revealed' ? { y: -60, opacity: 0 } : { y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <motion.div
                animate={phase === 'shaking' ? { x: [-5, 5, -5, 5, 0], rotate: [-4, 4, -4, 4, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="h-11 bg-gradient-to-br from-rose-400 to-red-500 rounded-xl border-4 border-red-600 flex items-center justify-center shadow-lg mx-2"
              >
                <div className="h-3 w-8 bg-yellow-300 rounded-sm" />
              </motion.div>
            </motion.div>

            {/* Box body */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-[86px] bg-gradient-to-br from-rose-400 to-red-500 rounded-xl border-4 border-red-600 flex items-center justify-center overflow-hidden shadow-2xl shadow-rose-500/40"
              animate={phase === 'shaking' ? { x: [-4, 4, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              {/* Ribbon cross */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute w-full h-5 bg-yellow-300/80" />
                <div className="absolute h-full w-5 bg-yellow-300/80" />
              </div>
              {/* Amount reveal */}
              <AnimatePresence>
                {phase === 'revealed' && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 20, delay: 0.1 }}
                    className="relative z-10 text-center"
                  >
                    <p className="text-white font-black text-base leading-tight drop-shadow">
                      +{formatUGX(earnedAmount)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* CTA area */}
          <AnimatePresence mode="wait">
            {phase === 'revealed' || alreadyClaimed ? (
              <motion.div key="claimed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <p className="font-bold text-emerald-400">
                    {phase === 'revealed'
                      ? `+${formatUGX(earnedAmount)} credited to wallet!`
                      : `${formatUGX(giftState.history?.[0]?.amount ?? 0)} claimed today!`}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Come back tomorrow for your next gift</p>
              </motion.div>
            ) : !isOpen ? (
              <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2.5">
                <p className="text-sm text-muted-foreground">Gift available daily between 3:30 and 4:00 PM</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Clock size={14} className="text-amber-400" />
                  <span className="text-sm font-bold font-mono text-amber-400">{countdown}</span>
                </div>
              </motion.div>
            ) : (
              <motion.div key="ready" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Your gift is waiting!</p>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRedeem}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-bold shadow-xl shadow-amber-400/30"
                >
                  <Gift size={18} /> Open Gift Box
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>

      {/* History */}
      {giftState.history.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard hover={false}>
            <div className="flex items-center gap-2 mb-3">
              <Star size={14} className="text-amber-400" />
              <h3 className="font-semibold text-sm">Gift History</h3>
            </div>
            <div className="space-y-0">
              {giftState.history.slice(0, 7).map((g, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-xs font-medium">Daily Gift</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(g.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-amber-400">+{formatUGX(g.amount)}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Info */}
      <div className="space-y-2 px-1">
        {[
          'Gift window: 3:30 PM – 4:00 PM daily',
          'One gift per day — must be claimed during the window',
          'Gift amount is set by the platform and credited instantly',
        ].map((t) => (
          <div key={t} className="flex items-start gap-2 text-xs text-muted-foreground">
            <Sparkles size={12} className="text-amber-400 shrink-0 mt-0.5" />
            <span>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
