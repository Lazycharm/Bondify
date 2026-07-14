import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, Clock, AlertCircle, XCircle,
  ArrowDownLeft, ArrowUpRight, Gift, Users, Calendar,
  Hash, CreditCard, FileText,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import CountUp from '@/components/ui/count-up';
import { formatUGX } from '@/lib/vipData';

// Sample transaction for demo — in production this would be fetched by ID
const SAMPLE_TX = {
  id: 'tx-001',
  type: 'deposit',
  amount: 500000,
  currency: 'UGX',
  status: 'completed',
  description: 'Deposit via Bank Gateway',
  reference: 'TB-DEP-20260713-0042',
  method: 'Bank Gateway',
  created_date: '2026-07-13T10:24:00Z',
  updated_date: '2026-07-13T10:26:32Z',
  breakdown: [
    { label: 'Principal Amount', amount: 500000 },
    { label: 'Processing Fee (0%)', amount: 0 },
    { label: 'Bonus Credit', amount: 15000 },
    { label: 'Total Credited', amount: 515000 },
  ],
};

const STATUS_CONFIG = {
  completed: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Completed' },
  pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Pending' },
  processing: { icon: AlertCircle, color: 'text-sky-500', bg: 'bg-sky-500/10', label: 'Processing' },
  failed: { icon: XCircle, color: 'text-danger', bg: 'bg-danger/10', label: 'Failed' },
  rejected: { icon: XCircle, color: 'text-danger', bg: 'bg-danger/10', label: 'Rejected' },
};

const TYPE_CONFIG = {
  deposit: { icon: ArrowDownLeft, label: 'Deposit' },
  withdrawal: { icon: ArrowUpRight, label: 'Withdrawal' },
  investment: { icon: FileText, label: 'Investment' },
  profit: { icon: ArrowDownLeft, label: 'Profit' },
  bonus: { icon: Gift, label: 'Bonus' },
  referral: { icon: Users, label: 'Referral' },
  gift: { icon: Gift, label: 'Gift Code' },
  checkin: { icon: Gift, label: 'Check-in Reward' },
};

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export default function TransactionDetails() {
  const { id } = useParams();
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch — replace with base44.entities.Transaction.get(id)
    setTimeout(() => {
      setTx({ ...SAMPLE_TX, id: id || SAMPLE_TX.id });
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="text-center py-32 space-y-2">
        <AlertCircle className="mx-auto text-muted-foreground" size={32} />
        <p className="text-muted-foreground">Transaction not found.</p>
        <Link to="/dashboard/wallet" className="text-sm text-emerald-500 hover:underline">Back to Wallet</Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[tx.status] || STATUS_CONFIG.pending;
  const typeCfg = TYPE_CONFIG[tx.type] || TYPE_CONFIG.deposit;
  const StatusIcon = statusCfg.icon;
  const TypeIcon = typeCfg.icon;
  const isIncoming = ['deposit', 'profit', 'bonus', 'referral', 'gift', 'checkin'].includes(tx.type);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back link */}
      <Link to="/dashboard/wallet" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Back to Wallet
      </Link>

      {/* Main card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-6 sm:p-8 text-center">
          <div className={`w-16 h-16 mx-auto rounded-2xl ${statusCfg.bg} flex items-center justify-center mb-4`}>
            <StatusIcon className={statusCfg.color} size={28} />
          </div>

          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusCfg.bg} ${statusCfg.color} mb-3`}>
            {statusCfg.label}
          </span>

          <div className="flex items-center justify-center gap-2 mb-1">
            <TypeIcon size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{typeCfg.label}</span>
          </div>

          <p className={`text-3xl font-bold ${isIncoming ? 'text-emerald-500' : 'text-foreground'}`}>
            {isIncoming ? '+' : '-'}
            <CountUp end={tx.amount} format={(n) => formatUGX(n).replace('UGX ', '')} duration={1} />
          </p>
          <p className="text-sm text-muted-foreground mt-1">{tx.description}</p>
        </GlassCard>
      </motion.div>

      {/* Transaction meta */}
      <GlassCard className="p-5 space-y-3">
        <h3 className="text-sm font-semibold mb-2">Transaction Details</h3>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2"><Hash size={15} /> Reference No.</span>
          <span className="font-mono font-medium text-xs">{tx.reference}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2"><CreditCard size={15} /> Method</span>
          <span className="font-medium">{tx.method}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2"><Calendar size={15} /> Date & Time</span>
          <span className="font-medium text-xs">{formatDate(tx.created_date)}</span>
        </div>

        {tx.updated_date !== tx.created_date && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2"><Clock size={15} /> Last Updated</span>
            <span className="font-medium text-xs">{formatDate(tx.updated_date)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2"><FileText size={15} /> Type</span>
          <span className="font-medium capitalize">{tx.type}</span>
        </div>
      </GlassCard>

      {/* Breakdown */}
      <GlassCard className="p-5">
        <h3 className="text-sm font-semibold mb-4">Financial Breakdown</h3>
        <div className="space-y-3">
          {tx.breakdown.map((row, i) => {
            const isTotal = row.label.toLowerCase().includes('total');
            return (
              <div key={i} className={`flex items-center justify-between text-sm ${isTotal ? 'pt-3 border-t border-border' : ''}`}>
                <span className={isTotal ? 'font-semibold' : 'text-muted-foreground'}>{row.label}</span>
                <span className={isTotal ? 'font-bold text-emerald-500' : 'font-medium'}>
                  {row.amount >= 0 ? '' : '-'}{formatUGX(Math.abs(row.amount))}
                </span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Timeline */}
      <GlassCard className="p-5">
        <h3 className="text-sm font-semibold mb-4">Timeline</h3>
        <div className="space-y-4">
          {[
            { label: 'Transaction initiated', date: tx.created_date, done: true },
            { label: 'Payment confirmed', date: tx.updated_date, done: tx.status === 'completed' },
            { label: 'Funds credited to wallet', date: tx.status === 'completed' ? tx.updated_date : null, done: tx.status === 'completed' },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${step.done ? 'bg-emerald-500/10' : 'bg-muted'}`}>
                <CheckCircle2 size={14} className={step.done ? 'text-emerald-500' : 'text-muted-foreground'} />
              </div>
              <div className="pt-0.5">
                <p className={`text-sm font-medium ${step.done ? '' : 'text-muted-foreground'}`}>{step.label}</p>
                {step.date && <p className="text-xs text-muted-foreground">{formatDate(step.date)}</p>}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}