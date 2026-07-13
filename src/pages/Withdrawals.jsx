import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight, Clock, CheckCircle2, AlertCircle, Wallet,
  Smartphone, Building2, Shield, Info,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import MagneticButton from '@/components/ui/MagneticButton';
import CountUp from '@/components/ui/count-up';
import { formatUGX } from '@/lib/vipData';
import { playSound } from '@/lib/sound';

const BALANCES = {
  withdrawable: 435000,
  pending: 120000,
  total_withdrawn: 1850000,
};

const PAYMENT_METHODS = [
  { id: 'mtn', name: 'MTN Mobile Money', icon: Smartphone, fee: '0%', time: 'Instant', color: 'from-yellow-400 to-amber-500' },
  { id: 'airtel', name: 'Airtel Money', icon: Smartphone, fee: '0%', time: 'Instant', color: 'from-red-400 to-rose-500' },
  { id: 'bank', name: 'Bank Transfer', icon: Building2, fee: 'UGX 2,000', time: '1-2 hours', color: 'from-sky-400 to-blue-500' },
];

const RECENT_WITHDRAWALS = [
  { id: 'wd-1', amount: 200000, method: 'MTN Mobile Money', status: 'completed', date: '2026-07-12T14:30:00Z', reference: 'WD-0712-0031' },
  { id: 'wd-2', amount: 150000, method: 'Airtel Money', status: 'processing', date: '2026-07-13T09:15:00Z', reference: 'WD-0713-0042' },
  { id: 'wd-3', amount: 300000, method: 'Bank Transfer', status: 'pending', date: '2026-07-13T11:00:00Z', reference: 'WD-0713-0058' },
  { id: 'wd-4', amount: 100000, method: 'MTN Mobile Money', status: 'completed', date: '2026-07-10T16:45:00Z', reference: 'WD-0710-0019' },
  { id: 'wd-5', amount: 50000, method: 'Airtel Money', status: 'rejected', date: '2026-07-09T10:20:00Z', reference: 'WD-0709-0007' },
];

const STATUS_CONFIG = {
  completed: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Completed' },
  pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Pending' },
  processing: { icon: AlertCircle, color: 'text-sky-500', bg: 'bg-sky-500/10', label: 'Processing' },
  rejected: { icon: AlertCircle, color: 'text-danger', bg: 'bg-danger/10', label: 'Rejected' },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Withdrawals() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('mtn');
  const [account, setAccount] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const withdrawable = BALANCES.withdrawable;
  const parsedAmount = parseFloat(amount) || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parsedAmount <= 0 || parsedAmount > withdrawable || !account) return;
    playSound('success');
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setAmount('');
      setAccount('');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl">
        <img src="https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=1200&q=80" alt="" className="w-full h-32 sm:h-40 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-emerald-900/70 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center p-6">
          <h1 className="text-2xl font-bold text-white">Withdrawal Center</h1>
          <p className="text-white/70 text-sm">Request payouts and track your transfer status.</p>
        </div>
      </div>

      {/* Balance summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
            <Wallet size={14} /> Withdrawable
          </div>
          <p className="text-2xl font-bold text-emerald-500">
            <CountUp end={withdrawable} format={(n) => formatUGX(n).replace('UGX ', '')} duration={1} prefix="UGX " />
          </p>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
            <Clock size={14} /> Pending
          </div>
          <p className="text-2xl font-bold text-amber-500">
            <CountUp end={BALANCES.pending} format={(n) => formatUGX(n).replace('UGX ', '')} duration={1} prefix="UGX " />
          </p>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
            <ArrowUpRight size={14} /> Total Withdrawn
          </div>
          <p className="text-2xl font-bold">
            <CountUp end={BALANCES.total_withdrawn} format={(n) => formatUGX(n).replace('UGX ', '')} duration={1} prefix="UGX " />
          </p>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Withdrawal form */}
        <GlassCard className="p-6">
          <h2 className="font-bold text-lg mb-1">Request Withdrawal</h2>
          <p className="text-xs text-muted-foreground mb-5">Withdrawals are processed within 1-2 hours on business days.</p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3">
                <CheckCircle2 className="text-emerald-500" size={28} />
              </div>
              <p className="font-semibold mb-1">Withdrawal Requested!</p>
              <p className="text-sm text-muted-foreground">Your request is being processed.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount (UGX)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  max={withdrawable}
                  className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-muted-foreground">Available: {formatUGX(withdrawable)}</span>
                  <button
                    type="button"
                    onClick={() => { setAmount(String(withdrawable)); playSound('click'); }}
                    className="text-xs text-emerald-500 hover:underline font-medium"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Payment method */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Payment Method</label>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => { setMethod(m.id); playSound('click'); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        method === m.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center`}>
                        <m.icon className="text-white" size={16} />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.time} · Fee: {m.fee}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${method === m.id ? 'border-primary bg-primary' : 'border-border'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Account details */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  {method === 'bank' ? 'Bank Account Number' : 'Phone Number / Account'}
                </label>
                <input
                  type="text"
                  placeholder={method === 'bank' ? 'Enter account number' : 'e.g. 0772 123 456'}
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Security note */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-sky-500/5 border border-sky-500/10">
                <Shield size={15} className="text-sky-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">All withdrawals require OTP verification. You'll receive a code via SMS.</p>
              </div>

              <MagneticButton
                type="submit"
                disabled={parsedAmount <= 0 || parsedAmount > withdrawable || !account}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ArrowUpRight size={18} /> Request Withdrawal
              </MagneticButton>
            </form>
          )}
        </GlassCard>

        {/* Recent withdrawals */}
        <GlassCard className="p-6">
          <h2 className="font-bold text-lg mb-4">Recent Withdrawals</h2>
          <div className="space-y-3">
            {RECENT_WITHDRAWALS.map((wd) => {
              const cfg = STATUS_CONFIG[wd.status] || STATUS_CONFIG.pending;
              const StatusIcon = cfg.icon;
              return (
                <div key={wd.id} className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border">
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                    <StatusIcon className={cfg.color} size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{formatUGX(wd.amount)}</p>
                    <p className="text-xs text-muted-foreground truncate">{wd.method} · {wd.reference}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(wd.date)}</p>
                  </div>
                  <span className={`text-xs font-medium ${cfg.color} shrink-0`}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Policy note */}
      <div className="flex items-start gap-2 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
        <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Withdrawals are available 24/7. Bonus balance cannot be withdrawn directly — it must be invested in bonds first.
          Minimum withdrawal amount is UGX 20,000.
        </p>
      </div>
    </div>
  );
}