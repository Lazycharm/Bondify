import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight, Clock, CheckCircle2, AlertCircle, Wallet,
  Smartphone, Shield, Info,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import MagneticButton from '@/components/ui/MagneticButton';
import { useAuth } from '@/lib/AuthContext';
import { getWalletBalance, getBonusBalance, isBonusWithdrawable } from '@/lib/depositStore';
import { addWithdrawal, getUserWithdrawals } from '@/lib/withdrawalStore';
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

  useEffect(() => {
    setBalance(getWalletBalance());
    setBonus(getBonusBalance());
    setBonusUnlocked(isBonusWithdrawable());
    if (user?.id) setHistory(getUserWithdrawals(user.id));
  }, [user]);

  const totalWithdrawable = balance + (bonusUnlocked ? bonus : 0);

  const parsedAmount = parseFloat(amount) || 0;
  const MIN_WITHDRAWAL = 20000;
  const availableBalance = totalWithdrawable;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (parsedAmount < MIN_WITHDRAWAL) { setError(`Minimum withdrawal is ${formatUGX(MIN_WITHDRAWAL)}`); return; }
    if (parsedAmount > availableBalance) { setError('Insufficient balance.'); return; }
    if (!account.trim()) { setError('Please enter your account number.'); return; }

    const result = addWithdrawal({
      userId: user?.id,
      userEmail: user?.email,
      amount: parsedAmount,
      method,
      account,
    });

    if (result?.error) { setError(result.error); return; }

    await sendTelegram(
      `📤 <b>New Withdrawal Request</b>\n\nUser: ${user?.email}\nAmount: ${formatUGX(parsedAmount)}\nMethod: ${method.toUpperCase()}\nAccount: ${account}\nID: ${result.id}`
    );

    setBalance(getWalletBalance());
    setHistory(getUserWithdrawals(user.id));
    playSound('success');
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setAmount(''); setAccount(''); }, 3000);
  }

  const pending = history.filter((w) => w.status === 'pending').reduce((s, w) => s + w.amount, 0);
  const totalWithdrawn = history.filter((w) => w.status === 'approved').reduce((s, w) => s + w.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Withdrawal Center</h1>
        <p className="text-muted-foreground text-sm">Request payouts and track your transfer status.</p>
      </div>

      {/* Balance summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Withdrawable Balance', value: availableBalance, icon: Wallet, color: 'text-emerald-500' },
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
        {/* Form */}
        <GlassCard className="p-6">
          <h2 className="font-bold text-lg mb-1">Request Withdrawal</h2>
          <p className="text-xs text-muted-foreground mb-5">Minimum: {formatUGX(MIN_WITHDRAWAL)} · Processed within 1-2 hours.</p>

          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3">
                <CheckCircle2 className="text-emerald-500" size={28} />
              </div>
              <p className="font-semibold mb-1">Withdrawal Requested!</p>
              <p className="text-sm text-muted-foreground">Your request is under review.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <span className="text-xs text-muted-foreground">
                    Available: {formatUGX(availableBalance)}
                    {bonusUnlocked && bonus > 0 && <span className="text-amber-500 ml-1">(incl. {formatUGX(bonus)} bonus)</span>}
                  </span>
                  <button type="button" onClick={() => setAmount(String(availableBalance))} className="text-xs text-emerald-500 hover:underline font-medium">Max</button>
                </div>
                {!bonusUnlocked && bonus > 0 && (
                  <p className="text-[11px] text-amber-500 mt-1">+ {formatUGX(bonus)} bonus unlocks after you complete Day 1 tasks.</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Payment Method</label>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => { setMethod(m.id); playSound('click'); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${method === m.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'}`}
                    >
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
                <input
                  type="text"
                  placeholder="e.g. 0772 123 456"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {error && <p className="text-xs text-rose-500">{error}</p>}

              <div className="flex items-start gap-2 p-3 rounded-xl bg-sky-500/5 border border-sky-500/10">
                <Shield size={15} className="text-sky-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">All withdrawals are reviewed and approved by our team before processing.</p>
              </div>

              <MagneticButton
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-teal-700 transition-all"
              >
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

      <div className="flex items-start gap-2 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
        <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Minimum withdrawal: {formatUGX(MIN_WITHDRAWAL)}. Bonus balance cannot be withdrawn directly — it must be converted through bond tasks first.
        </p>
      </div>
    </div>
  );
}
