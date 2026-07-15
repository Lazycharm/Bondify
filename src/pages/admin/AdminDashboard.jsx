import { useMemo } from 'react';
import { Download, Upload, Clock } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { getDeposits } from '@/lib/depositStore';
import { getWithdrawals } from '@/lib/withdrawalStore';
import { formatUGX } from '@/lib/vipData';
import { Link } from 'react-router-dom';

function StatCard({ icon: Icon, label, value, color, to }) {
  const card = (
    <GlassCard hover className="h-full cursor-pointer">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg`}>
        <Icon className="text-white" size={18} />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </GlassCard>
  );
  return to ? <Link to={to}>{card}</Link> : card;
}

export default function AdminDashboard() {
  const deposits = useMemo(() => getDeposits(), []);
  const withdrawals = useMemo(() => getWithdrawals(), []);

  const pendingDeposits = deposits.filter((d) => d.status === 'pending');
  const approvedDeposits = deposits.filter((d) => d.status === 'approved');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');

  const totalDeposited = approvedDeposits.reduce((s, d) => s + d.amount, 0);
  const totalWithdrawn = withdrawals.filter((w) => w.status === 'approved').reduce((s, w) => s + w.amount, 0);

  const recent = [...deposits, ...withdrawals]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Bondify platform activity at a glance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Pending Deposits" value={pendingDeposits.length} color="from-amber-400 to-orange-500" to="/admin/deposits" />
        <StatCard icon={Clock} label="Pending Withdrawals" value={pendingWithdrawals.length} color="from-sky-400 to-blue-500" to="/admin/withdrawals" />
        <StatCard icon={Download} label="Total Deposited" value={formatUGX(totalDeposited)} color="from-emerald-500 to-teal-600" />
        <StatCard icon={Upload} label="Total Withdrawn" value={formatUGX(totalWithdrawn)} color="from-violet-400 to-purple-600" />
      </div>

      {/* Recent activity */}
      <GlassCard hover={false}>
        <h2 className="font-semibold mb-4">Recent Activity</h2>
        {recent.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">No activity yet.</div>
        ) : (
          <div className="space-y-2">
            {recent.map((item) => {
              const isDeposit = item.id?.startsWith('DEP');
              const statusColor = {
                pending: 'text-amber-500 bg-amber-500/10',
                approved: 'text-emerald-500 bg-emerald-500/10',
                rejected: 'text-rose-500 bg-rose-500/10',
              }[item.status] || 'text-muted-foreground bg-muted';
              return (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDeposit ? 'bg-emerald-500/10' : 'bg-sky-500/10'}`}>
                    {isDeposit ? <Download size={15} className="text-emerald-500" /> : <Upload size={15} className="text-sky-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.userEmail}</p>
                    <p className="text-xs text-muted-foreground">{isDeposit ? 'Deposit' : 'Withdrawal'} · {item.network?.toUpperCase() || item.method}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{formatUGX(item.amount)}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusColor}`}>{item.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
