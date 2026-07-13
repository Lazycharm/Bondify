import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, CheckCircle2, Clock, Wallet, ChevronRight, PartyPopper } from 'lucide-react';
import { formatUGX } from '@/lib/vipData';

const CONFETTI_COLORS = ['#10b981', '#14b8a6', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444'];

function ConfettiPiece({ color, delay }) {
  return (
    <motion.div
      style={{ backgroundColor: color, position: 'absolute', top: 0, left: `${Math.random() * 100}%`, width: 8, height: 8, borderRadius: 2 }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{ y: 400, opacity: 0, rotate: 360 * 3 }}
      transition={{ duration: 2.5, delay, ease: 'easeIn' }}
    />
  );
}

function getSaleData() {
  try {
    const raw = localStorage.getItem('bondify_sale_data');
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

function getTaskState() {
  try {
    const raw = localStorage.getItem('bondify_task_state');
    return raw ? JSON.parse(raw) : { totalCompleted: 0, sessionDay: 1, sessionStartDate: new Date().toDateString(), completedToday: 0, lastDayDate: new Date().toDateString(), countdownEnd: null };
  } catch (_) { return { totalCompleted: 0, sessionDay: 1, sessionStartDate: new Date().toDateString(), completedToday: 0, lastDayDate: new Date().toDateString(), countdownEnd: null }; }
}

function saveTaskState(state) {
  localStorage.setItem('bondify_task_state', JSON.stringify(state));
}

function formatCountdown(endTime) {
  const remaining = Math.max(0, endTime - Date.now());
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ClaimProfits() {
  const navigate = useNavigate();
  const sale = getSaleData();

  const [claimed, setClaimed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [taskState, setTaskState] = useState(getTaskState);
  const [countdown, setCountdown] = useState('');
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    if (!sale) { navigate('/dashboard/tasks'); return; }
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!taskState.countdownEnd) return;
    const tick = () => setCountdown(formatCountdown(taskState.countdownEnd));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [taskState.countdownEnd]);

  if (!sale) return null;

  const { bond, buyer, taskIndex, bondsPerDay } = sale;
  // buyer.net_profit = what user actually earns (buyer_price - face_value - trust_fee)
  // buyer.buyer_price = full sale amount shown to buyer
  const netProfit = buyer.net_profit;
  const progressPercent = Math.min((taskIndex / bondsPerDay) * 100, 100);

  function handleClaim() {
    if (claimed) return;
    setClaimed(true);

    // Update task state
    const next = { ...taskState };
    next.completedToday = (next.completedToday ?? 0) + 1;
    next.totalCompleted = (next.totalCompleted ?? 0) + 1;

    // Advance session day if all daily tasks done
    if (next.completedToday >= bondsPerDay) {
      setAllDone(true);
      next.countdownEnd = Date.now() + 24 * 60 * 60 * 1000; // 24h from now

      // Advance session day (cap at 7 then reset)
      if (next.sessionDay >= 7) {
        next.sessionDay = 1;
        // Bump VIP would happen here via Supabase
      } else {
        next.sessionDay = (next.sessionDay ?? 1) + 1;
      }
    }

    setTaskState(next);
    saveTaskState(next);

    // Clear the active bond assignment
    localStorage.removeItem('bondify_active_bond');
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-10 relative">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {Array.from({ length: 30 }).map((_, i) => (
            <ConfettiPiece
              key={i}
              color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
              delay={i * 0.07}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span>Task {taskIndex} of {bondsPerDay}</span>
          <span>·</span>
          <span className="text-emerald-500 font-medium">Claim Profits</span>
        </div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PartyPopper size={24} className="text-amber-400" />
          Bond Sold!
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Your sale is confirmed. Claim your profits below.</p>
      </div>

      {/* Sale summary */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 space-y-4">
        {/* Big profit number */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-1">Your Net Profit</p>
          <p className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            + {formatUGX(netProfit)}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">
            Bond sold at {formatUGX(buyer.buyer_price)} · Bondify takes back {formatUGX(bond.face_value)}
          </p>
        </div>

        {/* Breakdown */}
        <div className="space-y-2 text-sm">
          {[
            { label: 'Bond', value: bond.name },
            { label: 'Sold To', value: `${buyer.name} · ${buyer.company}` },
            { label: 'Buyer Paid', value: formatUGX(buyer.buyer_price) },
            { label: 'Face Value (to Bondify)', value: `- ${formatUGX(bond.face_value)}` },
            { label: 'Trust Fee Returned', value: `+ ${formatUGX(bond.trust_fee)}` },
          ].map(row => (
            <div key={row.label} className="flex justify-between">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-medium text-right max-w-[65%] truncate">{row.value}</span>
            </div>
          ))}
          <div className="h-px bg-border" />
          <div className="flex justify-between font-semibold text-emerald-400">
            <span>Net Profit to Wallet</span>
            <span>+ {formatUGX(netProfit)}</span>
          </div>
        </div>
      </motion.div>

      {/* Daily task progress */}
      <div className="glass rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Daily Progress</span>
          <span className="text-muted-foreground">{taskIndex} / {bondsPerDay} tasks</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>
        {allDone && (
          <div className="flex items-center gap-2 text-sm text-emerald-500">
            <CheckCircle2 size={14} />
            <span className="font-medium">All daily tasks complete!</span>
          </div>
        )}
      </div>

      {/* Claim button */}
      <AnimatePresence mode="wait">
        {!claimed ? (
          <motion.button
            key="claim"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={handleClaim}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-base font-bold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30"
          >
            <Wallet size={18} />
            Claim {formatUGX(netProfit)}
          </motion.button>
        ) : (
          <motion.div
            key="claimed"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Payout Pending</p>
                <p className="text-xs text-muted-foreground">Your profit is queued for processing.</p>
              </div>
            </div>

            {/* 24h countdown if all daily tasks done */}
            {allDone && taskState.countdownEnd && (
              <div className="flex items-center gap-3 glass border border-border rounded-2xl p-4">
                <Clock size={20} className="text-amber-500 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Next tasks available in</p>
                  <p className="font-mono text-xl font-bold text-amber-500 mt-0.5">{countdown || '24:00:00'}</p>
                </div>
              </div>
            )}

            {/* Continue button — only if more tasks remain */}
            {!allDone && (
              <button
                onClick={() => navigate('/dashboard/tasks')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all"
              >
                Continue Tasks ({taskIndex}/{bondsPerDay}) <ChevronRight size={16} />
              </button>
            )}

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 rounded-2xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              Go to Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
