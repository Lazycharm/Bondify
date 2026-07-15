import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Search, RefreshCw } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { getAllDepositsFromSupabase, updateDepositInSupabase } from '@/lib/supabase_ops';
import { formatUGX } from '@/lib/vipData';
import { sendTelegram } from '@/lib/telegramNotify';
import { addNotification } from '@/lib/notificationStore';
import { playSound } from '@/lib/sound';

const STATUS = {
  pending: { label: 'Pending', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  approved: { label: 'Approved', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  rejected: { label: 'Rejected', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
};

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionError, setActionError] = useState('');

  async function loadDeposits() {
    setLoading(true);
    try {
      const data = await getAllDepositsFromSupabase();
      setDeposits(data);
    } catch {
      setDeposits([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDeposits(); }, []);

  const filtered = deposits.filter((d) => {
    const matchFilter = filter === 'all' || d.status === filter;
    const matchSearch = !search || d.userEmail?.toLowerCase().includes(search.toLowerCase()) || String(d.id)?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const act = useCallback(async (id, status) => {
    setActionError('');
    try {
      const updated = await updateDepositInSupabase(id, status);
      playSound(status === 'approved' ? 'success' : 'click');
      sendTelegram(
        `${status === 'approved' ? '✅' : '❌'} Deposit <b>${status.toUpperCase()}</b>\n\nID: ${updated.id}\nUser: ${updated.userEmail}\nAmount: ${formatUGX(updated.amount)}\nNetwork: ${updated.network?.toUpperCase()}`
      ).catch(() => {});
      if (updated.userId) {
        addNotification(updated.userId, {
          type: status === 'approved' ? 'success' : 'error',
          message: status === 'approved'
            ? `✅ Your deposit of ${formatUGX(updated.amount)} has been approved and credited to your wallet.`
            : `❌ Your deposit of ${formatUGX(updated.amount)} was rejected. Contact support if this is an error.`,
        });
      }
      setDeposits((prev) => prev.map((d) => d.id === id ? { ...d, status } : d));
    } catch (e) {
      console.error('[AdminDeposits] action failed:', e);
      setActionError(`Failed to ${status} deposit: ${e?.message || 'unknown error'}`);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Deposit Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">Approve or reject pending deposits.</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span><Clock size={14} className="inline mr-1" />{deposits.filter((d) => d.status === 'pending').length} pending</span>
          <button onClick={loadDeposits} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:bg-muted/30 transition-colors text-xs">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* Action error */}
      {actionError && (
        <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
          {actionError}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'approved', 'rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all capitalize ${
              filter === f ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-border text-muted-foreground hover:border-emerald-500/40'
            }`}
          >
            {f}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-auto px-3 py-1.5 rounded-full border border-border text-sm">
          <Search size={13} className="text-muted-foreground" />
          <input
            placeholder="Search email or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none w-36 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <GlassCard hover={false} className="overflow-hidden p-0">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading deposits…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No deposits found.</div>
        ) : (
          <div className="divide-y divide-border">
            <div className="grid grid-cols-12 gap-2 px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
              <div className="col-span-1">ID</div>
              <div className="col-span-3">User</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-1">Net</div>
              <div className="col-span-2">Ref</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2">Actions</div>
            </div>
            <AnimatePresence>
              {filtered.map((d) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-12 gap-2 px-5 py-4 items-center hover:bg-muted/20 transition-colors"
                >
                  <div className="col-span-1">
                    <p className="text-[10px] font-mono text-muted-foreground truncate">{String(d.id).slice(-8)}</p>
                    <p className="text-[9px] text-muted-foreground/60">{formatDate(d.created_at)}</p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm font-medium truncate">{d.userEmail}</p>
                    <p className="text-[10px] text-muted-foreground">SMS: {d.userSms}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-bold text-emerald-500">{formatUGX(d.amount)}</p>
                  </div>
                  <div className="col-span-1">
                    <span className="text-xs font-semibold uppercase">{d.network}</span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs truncate">{d.userSms}</p>
                  </div>
                  <div className="col-span-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS[d.status]?.color}`}>
                      {STATUS[d.status]?.label}
                    </span>
                  </div>
                  <div className="col-span-2 flex gap-1.5">
                    {d.status === 'pending' && (
                      <>
                        <button
                          onClick={() => act(d.id, 'approved')}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[11px] font-semibold hover:bg-emerald-500/20 transition-colors"
                        >
                          <CheckCircle2 size={12} /> Approve
                        </button>
                        <button
                          onClick={() => act(d.id, 'rejected')}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 text-rose-500 text-[11px] font-semibold hover:bg-rose-500/20 transition-colors"
                        >
                          <XCircle size={12} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
