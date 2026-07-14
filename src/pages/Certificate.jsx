import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, Crown, Star } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { VIP_LEVELS, formatUGX } from '@/lib/vipData';
import { getWalletBalance, getUserDeposits } from '@/lib/depositStore';
import { getTotalInvested } from '@/lib/bondStore';

function getCurrentVip(balance) {
  const sorted = [...VIP_LEVELS].sort((a, b) => b.min_investment - a.min_investment);
  return sorted.find((v) => balance >= v.min_investment) ?? VIP_LEVELS[0];
}

function getFirstDepositDate(userId) {
  const deps = getUserDeposits(userId);
  if (!deps.length) return null;
  const approved = deps.filter((d) => d.status === 'approved');
  if (!approved.length) return null;
  const sorted = [...approved].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  return new Date(sorted[0].created_at);
}

export default function Certificate() {
  const { user } = useAuth();
  const certRef = useRef(null);

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Investor';
  const balance = getWalletBalance();
  const vip = getCurrentVip(balance);
  const totalInvested = getTotalInvested(user?.id ?? '');
  const memberSince = getFirstDepositDate(user?.id ?? '');
  const certDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const memberId = user?.id?.slice(0, 8)?.toUpperCase() ?? 'XXXXXXXX';

  return (
    <div className="max-w-lg mx-auto pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="p-2 rounded-xl glass hover:bg-muted/50 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold">My Certificate</h1>
          <p className="text-xs text-muted-foreground">Your official Bondify investor certificate</p>
        </div>
      </div>

      {/* Certificate card */}
      <motion.div
        ref={certRef}
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div className="relative rounded-3xl overflow-hidden border-2 border-amber-400/40 shadow-2xl shadow-amber-500/10">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-emerald-950/80 to-navy" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />

          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-500/5 border border-emerald-500/10" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-amber-500/5 border border-amber-500/10" />

          <div className="relative z-10 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-400/40" />
                <Award size={28} className="text-amber-400" />
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-400/40" />
              </div>
              <p className="text-amber-400 font-bold text-xs uppercase tracking-[0.25em] mb-1">Certificate of Investment</p>
              <p className="text-white/50 text-[10px] tracking-widest">BONDIFY OFFICIAL</p>
            </div>

            {/* Recipient */}
            <div className="text-center mb-8">
              <p className="text-white/60 text-xs mb-2">This certifies that</p>
              <p className="text-3xl font-black text-white tracking-tight mb-1">{displayName}</p>
              <p className="text-white/50 text-xs">Member ID: {memberId}</p>
            </div>

            {/* VIP badge */}
            <div className="flex justify-center mb-8">
              <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r ${vip.color} shadow-lg`}>
                <Crown size={16} className="text-white" />
                <span className="text-white font-bold text-sm">VIP Level {vip.level} — {vip.name}</span>
                <Star size={14} className="text-white/70" />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { label: 'Total Invested', value: formatUGX(totalInvested), color: 'text-emerald-400' },
                { label: 'Member Since', value: memberSince ? memberSince.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'New Member', color: 'text-sky-400' },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className={`font-bold text-sm ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} className="text-amber-400/60 fill-amber-400/40" />
                ))}
              </div>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Footer */}
            <div className="text-center space-y-1">
              <p className="text-white/40 text-[10px]">
                Issued: {certDate}
              </p>
              <p className="text-white/30 text-[9px] uppercase tracking-wider">
                Bondify — Australia Treasury Bond Investment Platform
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="mt-5 space-y-3">
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            This certificate confirms your active membership in the Bondify investment community.
            Keep investing to unlock higher VIP levels and bigger daily earnings.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link to="/dashboard/invest">
            <button className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm">
              Buy More Bonds
            </button>
          </Link>
          <Link to="/dashboard/vip">
            <button className="w-full py-3 rounded-2xl glass border border-amber-400/30 text-amber-400 font-bold text-sm flex items-center justify-center gap-1.5">
              <Crown size={14} /> VIP Levels
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
