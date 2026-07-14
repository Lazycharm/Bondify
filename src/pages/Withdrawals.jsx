import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight, Clock, CheckCircle2, AlertCircle, Wallet,
  Smartphone, Shield, Info, Lock, Gift, Timer,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import MagneticButton from '@/components/ui/MagneticButton';
import { useAuth } from '@/lib/AuthContext';
import { getWalletBalance, getBonusBalance, isBonusWithdrawable } from '@/lib/depositStore';
import {
  addWithdrawal, getUserWithdrawals, getWithdrawalLockStatus, calcFee, getWithdrawalFeePct,
} from '@/lib/withdrawalStore';
import { formatUGX } from '@/lib/vipData';
import { sendTelegram } from '@/lib/telegramNotify';
import { playSound } from '@/lib/sound';

const PAYMENT_METHODS = [
  { id: 'mtn', name: 'MTN Mobile Money', color: 'from-yellow-400 to-amber-500' },
  { id: 'airtel', name: 'Airtel Money', color: 'from-red-400 to-rose-500' },
];

const STATUS_CONFIG = {
  approved: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Approved' },
  pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Pending' },
  rejected: { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Rejected' },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCountdown(unlockAt) {
  const ms = new Date(unlockAt) - Date.now();
  if (ms <= 0) return 'Unlocking…';
  const totalSecs = Math.floor(ms / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hrs = Math.floor((totalSecs % 86400) / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  if (days > 0) return `${days}d ${hrs}h remaining`;
  if (hrs > 0) return `${hrs}h ${mins}m remaining`;
  return `${mins}m remaining`;
}

export default function Withdrawals() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [bonusUnlocked, setBonusUnlocked] = useState(false);
  const [history, setHistory] = useState([]);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('mtn');
  const [account, setAccount] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [lockStatus, setLockStatus] = useState({ locked: false, reason: '', unlockAt: null });
  const [feePct, setFeePct] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setBalance(getWalletBalance());
    setBonus(getBonusBalance());
    setBonusUnlocked(isBonusWithdrawable());
    if (user?.id) setHistory(getUserWithdrawals(user.id));
    setLockStatus(getWithdrawalLockStatus());
    setFeePct(getWithdrawalFeePct());
  }, [user]);

  // Update countdown every minute
  useEffect(() => {
    if (!lockStatus.locked) return;
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, [lockStatus.locked]);

  const totalWithdrawable = balance + (bonusUnlocked ? bonus : 0);
  const parsedAmount = parseFloat(amount) || 0;
  const MIN_WITHDRAWAL = 10000;
  const { fee, net } = calcFee(parsedAmount);

  async function submitWithdrawal(amt, bypassLock = false) {
    setError('');
    if (amt < MIN_WITHDRAWAL) { setError(`Minimum withdrawal is ${formatUGX(MIN_WITHDRAWAL)}`); return false; }
    if (amt > totalWithdrawable) { setError('Insufficient balance.'); return false; }
    if (!account.trim()) { setError('Please enter your account number.'); return false; }

    const result = addWithdrawal({ userId: user?.id, userEmail: user?.email, amount: amt, method, account, bypassLock });
    if (result?.error) { setError(result.error); return false; }

    await sendTelegram(
      `📤 <b>New Withdrawal Request</b>\n\nUser: ${user?.email}\nAmount: ${formatUGX(amt)}${result.fee > 0 ? `\nFee (${feePct}%): ${formatUGX(result.fee)}\nNet payout: ${formatUGX(result.net_amount)}` : ''}\nMethod: ${method.toUpperCase()}\nAccount: ${account}\nID: ${result.id}`
    );

    setBalance(getWalletBalance());
    setHistory(getUserWithdrawals(user.id));
    playSound('success');
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setAmount(''); setAccount(''); }, 3000);
    return true;
  }

  const pending = history.filter((w) => w.status === 'pending').reduce((s, w) => s + w.amount, 0);
  const totalWithdrawn = history.filter((w) => w.status === 'approved').reduce((s, w) => s + w.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Withdrawal Center</h1>
        <p className="text-muted-foreground text-sm">Request payouts and track your transfer status.</p>
      </div>

      {/* Lock status banner */}
      {lockStatus.locked && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <Lock size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-400">Withdrawals Locked</p>
            <p className="text-xs text-muted-foreground mt-0.5">{lockStatus.reason}</p>
            {lockStatus.unlockAt && (
              <div className="flex items-center gap-1.5 mt-2">
                <Timer size={13} className="text-amber-400" />
                <span className="text-xs font-medium text-amber-400">{formatCountdown(lockStatus.unlockAt)}</span>
              </div>
            )}
            {bonus > 0 && bonusUnlocked && (
              <p className="text-xs text-emerald-400 mt-2 font-medium">
                ✓ Welcome bonus ({formatUGX(bonus)}) and referral rewards are exempt — scroll down to withdraw.
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Fee banner */}
      {feePct > 0 && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-sky-500/8 border border-sky-500/20">
          <Info size={15} className="text-sky-400 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            A <span className="font-semibold text-sky-400">{feePct}% platform fee</span> applies to all withdrawals.
            You receive the amount after the fee is deducted.
          </p>
        </div>
      )}

      {/* Balance summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Withdrawable Balance', value: totalWithdrawable, icon: Wallet, color: 'text-emerald-500' },
          { label: 'Pending', value: pending, icon: Clock, color: 'text-amber-500' },
          { label: 'Total Withdrawn', value: totalWithdrawn, icon: ArrowUpRight, color: 'text-foreground' },
        ].map((card) => (
          <GlassCard key={card.label} className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <card.icon size={14} /> {card.label}
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{formatUGX(card.value)}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Main withdrawal form */}
        <GlassCard className="p-6">
          <h2 className="font-bold text-lg mb-1">Request Withdrawal</h2>
          <p className="text-xs text-muted-foreground mb-5">
            Min: {formatUGX(MIN_WITHDRAWAL)}{feePct > 0 ? ` · ${feePct}% fee deducted` : ''} · Processed within 1–2 hours.
          </p>

          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3">
                <CheckCircle2 className="text-emerald-500" size={28} />
              </div>
              <p className="font-semibold mb-1">Withdrawal Requested!</p>
              <p className="text-sm text-muted-foreground">Your request is under review.</p>
            </motion.div>
          ) : lockStatus.locked ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <Lock size={24} className="text-amber-400" />
              </div>
              <p className="font-semibold text-sm">Earnings are locked</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">{lockStatus.reason}.</p>
              {lockStatus.unlockAt && (
                <p className="text-sm font-bold text-amber-400">{formatCountdown(lockStatus.unlockAt)}</p>
              )}
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); submitWithdrawal(parsedAmount); }} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount (UGX)</label>
                <input
                  type="number"
                  placeholder={`Min ${formatUGX(MIN_WITHDRAWAL)}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-muted-foreground">Available: {formatUGX(totalWithdrawable)}</span>
                  <button type="button" onClick={() => setAmount(String(totalWithdrawable))} className="text-xs text-emerald-500 hover:underline font-medium">Max</button>
                </div>
                {feePct > 0 && parsedAmount > 0 && (
                  <div className="mt-2 p-2.5 rounded-lg bg-muted/40 space-y-1 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Requested</span><span>{formatUGX(parsedAmount)}</span>
                    </div>
                    <div className="flex justify-between text-rose-400">
                      <span>Fee ({feePct}%)</span><span>- {formatUGX(fee)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-emerald-400 border-t border-border pt-1">
                      <span>You receive</span><span>{formatUGX(net)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Payment Method</label>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button key={m.id} type="button" onClick={() => { setMethod(m.id); playSound('click'); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${method === m.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'}`}>
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center`}>
                        <Smartphone className="text-white" size={16} />
                      </div>
                      <span className="text-sm font-medium flex-1 text-left">{m.name}</span>
                      <div className={`w-4 h-4 rounded-full border-2 ${method === m.id ? 'border-primary bg-primary' : 'border-border'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone Number / Account</label>
                <input type="text" placeholder="e.g. 0772 123 456" value={account} onChange={(e) => setAccount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              {error && <p className="text-xs text-rose-500">{error}</p>}

              <div className="flex items-start gap-2 p-3 rounded-xl bg-sky-500/5 border border-sky-500/10">
                <Shield size={15} className="text-sky-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">All withdrawals are reviewed by our team before processing.</p>
              </div>

              <MagneticButton type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-teal-700 transition-all">
                <ArrowUpRight size={18} /> Request Withdrawal
              </MagneticButton>
            </form>
          )}
        </GlassCard>

        {/* History */}
        <GlassCard className="p-6">
          <h2 className="font-bold text-lg mb-4">Withdrawal History</h2>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
              <ArrowUpRight size={28} className="text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No withdrawals yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((wd) => {
                const cfg = STATUS_CONFIG[wd.status] || STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                return (
                  <div key={wd.id} className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border">
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <StatusIcon className={cfg.color} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{formatUGX(wd.amount)}</p>
                      {wd.fee > 0 && (
                        <p className="text-[10px] text-muted-foreground">Fee: {formatUGX(wd.fee)} · Payout: {formatUGX(wd.net_amount)}</p>
                      )}
                      <p className="text-xs text-muted-foreground truncate capitalize">{wd.method} · {wd.id}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(wd.created_at)}</p>
                    </div>
                    <span className={`text-xs font-medium ${cfg.color} shrink-0`}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Bonus withdrawal — bypasses lock */}
      {bonus > 0 && bonusUnlocked && lockStatus.locked && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-6 border-emerald-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Gift size={20} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Welcome Bonus — Always Available</h3>
                <p className="text-xs text-muted-foreground">Your bonus & referral rewards are not subject to the lock period.</p>
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-500 mb-4">{formatUGX(bonus)}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Payment Method</label>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button key={m.id} type="button" onClick={() => { setMethod(m.id); playSound('click'); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${method === m.id ? 'border-emerald-500 bg-emerald-500/5' : 'border-border hover:bg-muted/30'}`}>
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center`}>
                        <Smartphone className="text-white" size={14} />
                      </div>
                      <span className="text-sm font-medium flex-1 text-left">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <input type="text" placeholder="Phone number / Account" value={account} onChange={(e) => setAccount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              {error && <p className="text-xs text-rose-500">{error}</p>}
              <button
                onClick={() => submitWithdrawal(bonus, true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Gift size={16} /> Withdraw Bonus {formatUGX(bonus)}
              </button>
            </div>
          </GlassCard>
        </motion.div>
      )}

      <div className="flex items-start gap-2 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
        <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Minimum withdrawal: {formatUGX(MIN_WITHDRAWAL)}.
          {feePct > 0 && ` A ${feePct}% fee is deducted from each withdrawal — you receive the net amount.`}
          {' '}Welcome bonus and referral rewards are exempt from lock periods.
        </p>
      </div>
    </div>
  );
}
