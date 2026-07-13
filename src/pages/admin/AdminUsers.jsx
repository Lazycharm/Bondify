import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Mail, Wallet, TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { getDeposits } from '@/lib/depositStore';
import { formatUGX } from '@/lib/vipData';
import { VIP_LEVELS } from '@/lib/vipData';

function getCurrentVip(balance) {
  const sorted = [...VIP_LEVELS].sort((a, b) => b.min_investment - a.min_investment);
  return sorted.find((v) => balance >= v.min_investment) ?? VIP_LEVELS[0];
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const deposits = getDeposits();

    const map = {};
    deposits.forEach((d) => {
      const uid = d.userId;
      if (!uid) return;
      if (!map[uid]) {
        map[uid] = {
          userId: uid,
          email: d.userEmail || `user-${uid.slice(0, 8)}`,
          allDeposits: [],
          firstSeen: d.created_at,
        };
      }
      map[uid].allDeposits.push(d);
      if (new Date(d.created_at) < new Date(map[uid].firstSeen)) {
        map[uid].firstSeen = d.created_at;
      }
    });

    const list = Object.values(map).map((u) => {
      const approved = u.allDeposits.filter((d) => d.status === 'approved');
      const pending  = u.allDeposits.filter((d) => d.status === 'pending');
      const totalDeposited = approved.reduce((s, d) => s + parseInt(d.amount, 10), 0);
      const vip = getCurrentVip(totalDeposited);
      return {
        ...u,
        totalDeposited,
        depositCount: u.allDeposits.length,
        approvedCount: approved.length,
        pendingCount: pending.length,
        vip,
      };
    });

    list.sort((a, b) => new Date(b.firstSeen) - new Date(a.firstSeen));
    setUsers(list);
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'active' && u.approvedCount > 0) ||
      (filter === 'pending' && u.pendingCount > 0) ||
      (filter === 'new' && u.depositCount === 0);
    return matchSearch && matchFilter;
  });

  const totalUsers      = users.length;
  const activeUsers     = users.filter((u) => u.approvedCount > 0).length;
  const totalDeposited  = users.reduce((s, u) => s + u.totalDeposited, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">All registered users derived from deposit activity.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Users',       value: totalUsers,                icon: Users,      color: 'from-violet-500 to-purple-600' },
          { label: 'Active Depositors', value: activeUsers,               icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
          { label: 'Total Deposited',   value: formatUGX(totalDeposited), icon: Wallet,     color: 'from-amber-400 to-orange-500', raw: true },
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

      {/* Filters */}
      <GlassCard hover={false} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all',     label: 'All' },
              { key: 'active',  label: 'Active' },
              { key: 'pending', label: 'Pending' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  filter === f.key ? 'bg-violet-500 text-white' : 'glass text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</p>
      </GlassCard>

      {/* User list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-sm">
          {users.length === 0 ? 'No deposits recorded yet — users appear here once they submit a deposit.' : 'No users match your search.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((u, i) => (
            <motion.div
              key={u.userId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <GlassCard hover={false} className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Avatar + identity */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${u.vip.color} flex items-center justify-center shrink-0 text-white font-bold text-sm`}>
                    {u.email[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate flex items-center gap-1.5">
                      <Mail size={12} className="text-muted-foreground shrink-0" />
                      {u.email}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium text-white bg-gradient-to-r ${u.vip.color}`}>
                        VIP {u.vip.level} · {u.vip.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">Joined {formatDate(u.firstSeen)}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center sm:text-right shrink-0">
                  <div>
                    <p className="text-xs text-muted-foreground">Deposited</p>
                    <p className="text-sm font-bold text-emerald-400">{formatUGX(u.totalDeposited)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Approved</p>
                    <p className="text-sm font-bold flex items-center justify-center sm:justify-end gap-1">
                      <CheckCircle2 size={13} className="text-emerald-500" />{u.approvedCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="text-sm font-bold flex items-center justify-center sm:justify-end gap-1">
                      <Clock size={13} className={u.pendingCount > 0 ? 'text-amber-500' : 'text-muted-foreground'} />
                      {u.pendingCount}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
