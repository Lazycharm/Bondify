import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, TrendingUp, Clock, ChevronRight, Zap, Lock, Star, ArrowUp } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { DEMO_BONDS, UPGRADE_BONDS, generateBuyerSession } from '@/lib/bondData';
import { VIP_LEVELS, formatUGX, formatUGXShort, getBondsPerDay } from '@/lib/vipData';

const DEMO_VIP_LEVEL = 1;
const DEMO_WALLET_BALANCE = 185000;
const MIN_BALANCE = 5000;

function getTaskState() {
  try {
    const raw = localStorage.getItem('bondify_task_state');
    if (raw) return JSON.parse(raw);
  } catch (_) { /* ignore */ }
  return { totalCompleted: 0, sessionDay: 1, sessionStartDate: new Date().toDateString(), completedToday: 0, lastDayDate: new Date().toDateString(), countdownEnd: null };
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

export default function TaskCenter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [taskState, setTaskState] = useState(getTaskState);
  const [selectedBond, setSelectedBond] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [walletBalance] = useState(DEMO_WALLET_BALANCE);

  const vipLevel = DEMO_VIP_LEVEL;
  const vipData = VIP_LEVELS.find(v => v.level === vipLevel);
  const bondsPerDay = getBondsPerDay(vipLevel);
  const bonds = DEMO_BONDS[vipLevel] ?? [];
  const upgradeBond = UPGRADE_BONDS[vipLevel];

  // Reset daily count if day changed
  useEffect(() => {
    const today = new Date().toDateString();
    if (taskState.lastDayDate !== today) {
      const next = { ...taskState, completedToday: 0, lastDayDate: today, countdownEnd: null };
      setTaskState(next);
      saveTaskState(next);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!taskState.countdownEnd) return;
    const tick = () => setCountdown(formatCountdown(taskState.countdownEnd));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [taskState.countdownEnd]);

  const dailyDone = taskState.completedToday >= bondsPerDay;
  const showUpgrade = taskState.sessionDay >= 4 && upgradeBond;
  const progress = Math.min(taskState.completedToday / bondsPerDay, 1);

  function startTask(bond) {
    const affordable = walletBalance - bond.trust_fee >= MIN_BALANCE;
    if (!affordable) return;
    setSelectedBond(bond);
  }

  function confirmTask() {
    if (!selectedBond) return;
    // Generate unique buyers for this user + bond + today (seeded so refresh is stable)
    const buyers = generateBuyerSession(user?.id, selectedBond.id, selectedBond);
    localStorage.setItem('bondify_active_bond', JSON.stringify({
      bond: selectedBond,
      buyers,
      vipLevel,
      taskIndex: (taskState.completedToday ?? 0) + 1,
      bondsPerDay,
    }));
    setSelectedBond(null);
    navigate('/dashboard/tasks/sell');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Task Center</h1>
        <p className="text-muted-foreground text-sm mt-1">Select a bond, sell to the highest buyer, claim your profit.</p>
      </div>

      {/* VIP + Progress */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${vipData?.color} flex items-center justify-center`}>
              <Star size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Level</p>
              <p className="font-bold">VIP {vipLevel} · {vipData?.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Day</p>
            <p className="font-bold text-emerald-500">{taskState.sessionDay} / 7</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Today's Tasks</span>
            <span className={`font-semibold ${dailyDone ? 'text-emerald-500' : 'text-foreground'}`}>
              {taskState.completedToday} / {bondsPerDay}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        {dailyDone && (
          <div className="mt-4 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
            <Clock size={16} className="text-emerald-500 shrink-0" />
            <span className="text-sm text-emerald-500 font-medium">
              All tasks complete! Next reset in: <span className="font-mono">{countdown || '24:00:00'}</span>
            </span>
          </div>
        )}
      </motion.div>

      {/* Upgrade teaser */}
      {showUpgrade && !dailyDone && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ArrowUp size={16} className="text-amber-500" />
                <span className="text-sm font-semibold text-amber-500">Upgrade Preview — VIP {upgradeBond.next_vip} {upgradeBond.next_name}</span>
              </div>
              <p className="text-sm text-muted-foreground">{upgradeBond.bond_name}</p>
              <p className="text-xs text-muted-foreground">
                Trust fee: <span className="text-amber-400 font-medium">{formatUGX(upgradeBond.trust_fee)}</span>
                {' · '}Profit up to: <span className="text-emerald-400 font-medium">{formatUGX(upgradeBond.profit_high)}</span>
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/vip')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors shrink-0 ml-4"
            >
              Upgrade <ChevronRight size={14} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Bond grid */}
      <div>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <CheckSquare size={16} className="text-emerald-500" />
          Available Bonds — VIP {vipLevel} ({bonds.length} bonds)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {bonds.map((bond, i) => {
            const canAfford = walletBalance - bond.trust_fee >= MIN_BALANCE;
            return (
              <motion.div
                key={bond.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`glass rounded-2xl p-4 border transition-all ${canAfford && !dailyDone ? 'border-border hover:border-emerald-500/30' : 'border-border opacity-60'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight truncate">{bond.name}</p>
                    <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">{bond.type}</span>
                  </div>
                  {!canAfford && <Lock size={14} className="text-muted-foreground mt-0.5 ml-2 shrink-0" />}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Face Value</p>
                    <p className="font-semibold">{formatUGXShort(bond.face_value)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Trust Fee</p>
                    <p className="font-semibold text-orange-400">{formatUGX(bond.trust_fee)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Max Profit</p>
                    <p className="font-semibold text-emerald-400">{formatUGX(bond.profit_high)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Buyers</p>
                    <p className="font-semibold">3 waiting</p>
                  </div>
                </div>

                <button
                  onClick={() => !dailyDone && canAfford && startTask(bond)}
                  disabled={dailyDone || !canAfford}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all ${
                    dailyDone || !canAfford
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
                  }`}
                >
                  {dailyDone ? (
                    <><Clock size={14} /> Tasks Complete</>
                  ) : !canAfford ? (
                    <><Lock size={14} /> Insufficient Balance</>
                  ) : (
                    <><Zap size={14} /> Start Task</>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bond confirmation modal */}
      <AnimatePresence>
        {selectedBond && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-navy/60 backdrop-blur-sm"
            onClick={() => setSelectedBond(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md glass rounded-2xl p-6 space-y-4"
            >
              <h3 className="font-bold text-lg">Confirm Bond Purchase</h3>

              <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bond</span>
                  <span className="font-medium text-right max-w-[60%]">{selectedBond.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Face Value</span>
                  <span className="font-medium">{formatUGX(selectedBond.face_value)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trust Fee (deducted)</span>
                  <span className="font-semibold text-orange-400">- {formatUGX(selectedBond.trust_fee)}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wallet after purchase</span>
                  <span className="font-semibold">{formatUGX(walletBalance - selectedBond.trust_fee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Buyers will bid from</span>
                  <span className="font-semibold">{formatUGX(selectedBond.face_value + selectedBond.trust_fee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your max profit</span>
                  <span className="font-semibold text-emerald-400">up to {formatUGX(selectedBond.profit_high)}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <TrendingUp size={12} className="mt-0.5 shrink-0 text-emerald-500" />
                You will now select from 3 buyers. Sell to the highest bidder to maximize profit.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedBond(null)}
                  className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmTask}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all"
                >
                  Confirm & Sell
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
