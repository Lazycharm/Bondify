import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Wallet, TrendingUp, Clock, CheckCircle2, Edit2, X, Plus, Minus, RefreshCw,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { getAllDepositsFromSupabase } from '@/lib/supabase_ops';
import { formatUGX, VIP_LEVELS } from '@/lib/vipData';
import { playSound } from '@/lib/sound';

function getCurrentVip(balance) {
  const sorted = [...VIP_LEVELS].sort((a, b) => b.min_investment - a.min_investment);
  return sorted.find((v) => balance >= v.min_investment) ?? VIP_LEVELS[0];
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getAdminOverrides() {
  try { return JSON.parse(localStorage.getItem('bondify_admin_user_overrides') || '{}'); } catch { return {}; }
}

function setAdminOverride(userId, key, value) {
  const all = getAdminOverrides();
  if (!all[userId]) all[userId] = {};
  all[userId][key] = value;
  localStorage.setItem('bondify_admin_user_overrides', JSON.stringify(all));
}

function EditModal({ user: u, onClose, onSave }) {
  const overrides = getAdminOverrides()[u.userId] || {};
  const [vipOverride, setVipOverride] = useState(overrides.vip_level ?? '');
  const [taskFlow, setTaskFlow] = useState(overrides.task_flow ?? '');
  const [balanceAdj, setBalanceAdj] = useState('');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (vipOverride) setAdminOverride(u.userId, 'vip_level', parseInt(vipOverride, 10));
    if (taskFlow) setAdminOverride(u.userId, 'task_flow', taskFlow);
    if (balanceAdj && parseInt(balanceAdj, 10) !== 0) {
      const amt = parseInt(balanceAdj, 10);
      if (!isNaN(amt)) {
        const gifts = JSON.parse(localStorage.getItem('bondify_gifts') || '[]');
        gifts.push({ id: `ADJ-${Date.now()}`, amount: amt, note: `Admin adjustment for ${u.email}`, created_at: new Date().toISOString() });
        localStorage.setItem('bondify_gifts', JSON.stringify(gifts));
      }
    }
    playSound('success');
    setSaved(true);
    setTimeout(() => { onSave(); onClose(); }, 1200);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-navy/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm glass rounded-2xl p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-sm">Edit User</p>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{u.email}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {/* VIP Level override */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold block">VIP Level Override (1–10)</label>
            <div className="flex gap-2">
              <select
                value={vipOverride}
                onChange={(e) => setVipOverride(e.target.value)}
                className="flex-1 bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              >
                <option value="">Keep current (auto)</option>
                {VIP_LEVELS.map((v) => (
                  <option key={v.level} value={v.level}>VIP {v.level} — {v.name}</option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-muted-foreground">Overrides the VIP level calculated from balance.</p>
          </div>

          {/* Task Flow */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold block">Task Flow</label>
            <div className="flex gap-2">
              {['', 'daily', 'sales'].map((f) => (
                <button
                  key={f || 'auto'}
                  onClick={() => setTaskFlow(f)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    taskFlow === f
                      ? f === 'sales' ? 'bg-violet-500 text-white border-violet-500' : 'bg-emerald-500 text-white border-emerald-500'
                      : 'glass border-border text-muted-foreground'
                  }`}
                >
                  {f || 'Auto'}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">Force user into Daily or Sales task mode.</p>
          </div>

          {/* Balance adjustment */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold block">Balance Adjustment (UGX)</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBalanceAdj((v) => String(-(Math.abs(parseInt(v, 10) || 0))))}
                className="w-9 h-9 rounded-xl glass border border-border flex items-center justify-center text-rose-400"
              >
                <Minus size={14} />
              </button>
              <input
                type="number"
                value={balanceAdj}
                onChange={(e) => setBalanceAdj(e.target.value)}
                placeholder="0"
                className="flex-1 bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-center"
              />
              <button
                onClick={() => setBalanceAdj((v) => String(Math.abs(parseInt(v, 10) || 0)))}
                className="w-9 h-9 rounded-xl glass border border-border flex items-center justify-center text-emerald-400"
              >
                <Plus size={14} />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground">Positive = add to wallet. Negative = deduct from wallet. Applied as a gift credit.</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2"
        >
          {saved ? <><CheckCircle2 size={16} /> Saved!</> : 'Save Changes'}
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    setLoading(true);
    try {
      const deposits = await getAllDepositsFromSupabase();
      const overrides = getAdminOverrides();
      const map = {};

      deposits.forEach((d) => {
        const uid = d.userId;
        if (!uid) return;
        if (!map[uid]) {
          map[uid] = { userId: uid, email: d.userEmail || `user-${uid.slice(0, 8)}`, allDeposits: [], firstSeen: d.created_at };
        }
        map[uid].allDeposits.push(d);
        if (new Date(d.created_at) < new Date(map[uid].firstSeen)) map[uid].firstSeen = d.created_at;
      });

      const list = Object.values(map).map((u) => {
        const approved = u.allDeposits.filter((d) => d.status === 'approved');
        const pending = u.allDeposits.filter((d) => d.status === 'pending');
        const totalDeposited = approved.reduce((s, d) => s + parseInt(d.amount, 10), 0);
        const uOverride = overrides[u.userId] || {};
        const vip = uOverride.vip_level
          ? (VIP_LEVELS.find((v) => v.level === uOverride.vip_level) ?? getCurrentVip(totalDeposited))
          : getCurrentVip(totalDeposited);
        const taskFlow = uOverride.task_flow || 'daily';
        return { ...u, totalDeposited, depositCount: u.allDeposits.length, approvedCount: approved.length, pendingCount: pending.length, vip, taskFlow };
      });

      list.sort((a, b) => new Date(b.firstSeen) - new Date(a.firstSeen));
      setUsers(list);
    } catch (e) {
      console.error('[AdminUsers] loadUsers failed:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'active' && u.approvedCount > 0) ||
      (filter === 'pending' && u.pendingCount > 0) ||
      (filter === 'new' && u.depositCount === 0);
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">All users from deposit activity — edit VIP, task mode, and balances.</p>
        </div>
        <button onClick={loadUsers} disabled={loading} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:bg-muted/30 transition-colors text-xs disabled:opacity-50">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'from-violet-500 to-purple-600' },
          { label: 'Active Depositors', value: users.filter((u) => u.approvedCount > 0).length, icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
          { label: 'Total Deposited', value: formatUGX(users.reduce((s, u) => s + u.totalDeposited, 0)), icon: Wallet, color: 'from-amber-400 to-orange-500', raw: true },
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
            {[{ key: 'all', label: 'All' }, { key: 'active', label: 'Active' }, { key: 'pending', label: 'Pending' }].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${filter === f.key ? 'bg-violet-500 text-white' : 'glass text-muted-foreground hover:text-foreground'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</p>
      </GlassCard>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground text-sm">Loading users…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-sm">
          {users.length === 0 ? 'No deposits recorded yet.' : 'No users match your search.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((u, i) => (
            <motion.div key={u.userId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <GlassCard hover={false}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${u.vip.color} flex items-center justify-center shrink-0 text-white font-bold text-sm`}>
                      {u.email[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{u.email}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium text-white bg-gradient-to-r ${u.vip.color}`}>
                          VIP {u.vip.level} · {u.vip.name}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${u.taskFlow === 'sales' ? 'bg-violet-500/20 text-violet-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {u.taskFlow === 'sales' ? 'Sales Trader' : 'Daily Earner'}
                        </span>
                        <span className="text-[10px] text-muted-foreground">Joined {formatDate(u.firstSeen)}</span>
                      </div>
                    </div>
                  </div>

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

                  <button
                    onClick={() => setEditing(u)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass border border-border text-xs font-semibold hover:bg-muted/50 transition-colors shrink-0"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editing && <EditModal user={editing} onClose={() => setEditing(null)} onSave={loadUsers} />}
      </AnimatePresence>
    </div>
  );
}
