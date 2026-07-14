import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Search, ChevronRight } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { formatUGX } from '@/lib/vipData';
import { getReferrals } from '@/lib/referralStore';
import { getDeposits } from '@/lib/depositStore';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const all = getReferrals();
    const deposits = getDeposits().filter((d) => d.status === 'approved');

    const withStats = all.map((r) => {
      const userDeposits = deposits.filter((d) => d.userEmail?.toLowerCase() === r.referredEmail?.toLowerCase());
      const totalDeposited = userDeposits.reduce((s, d) => s + parseInt(d.amount, 10), 0);
      return { ...r, totalDeposited };
    });

    withStats.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));
    setReferrals(withStats);
  }, []);

  const filtered = referrals.filter((r) =>
    !search ||
    r.referredEmail?.toLowerCase().includes(search.toLowerCase()) ||
    r.referrerId?.toLowerCase().includes(search.toLowerCase())
  );

  const totalReferralDeposits = referrals.reduce((s, r) => s + (r.totalDeposited || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Referrals</h1>
        <p className="text-sm text-muted-foreground mt-1">All referral relationships — who invited who.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Referrals', value: referrals.length, icon: Users, color: 'from-violet-500 to-purple-600' },
          { label: 'Unique Referrers', value: new Set(referrals.map((r) => r.referrerId)).size, icon: Trophy, color: 'from-amber-400 to-orange-500' },
          { label: 'Deposits from Referrals', value: formatUGX(totalReferralDeposits), icon: ChevronRight, color: 'from-emerald-500 to-teal-600', raw: true },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <GlassCard hover={false}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shrink-0`}>
                  <s.icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold">{s.raw ? s.value : s.value.toLocaleString()}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard hover={false}>
        <div className="flex items-center gap-3 mb-4">
          <Search size={15} className="text-muted-foreground shrink-0" />
          <input
            placeholder="Search by email or referrer code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No referrals recorded yet.</div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 rounded-xl">
              <div className="col-span-4">Referred User</div>
              <div className="col-span-3">Referred By (Code)</div>
              <div className="col-span-2">Joined</div>
              <div className="col-span-3 text-right">Their Deposits</div>
            </div>
            {filtered.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="grid grid-cols-12 gap-2 px-2 py-3 items-center hover:bg-muted/20 transition-colors rounded-xl"
              >
                <div className="col-span-4">
                  <p className="text-sm font-medium truncate">{r.referredEmail}</p>
                </div>
                <div className="col-span-3">
                  <span className="text-xs font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">{r.referrerId}</span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">{formatDate(r.joinedAt)}</p>
                </div>
                <div className="col-span-3 text-right">
                  <p className={`text-sm font-bold ${r.totalDeposited > 0 ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                    {formatUGX(r.totalDeposited)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
