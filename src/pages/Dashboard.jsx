import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, TrendingUp, Crown, Users, Clock,
  Gift, Calendar, ArrowUpRight, Eye, EyeOff,
  ChevronRight, Sparkles, BarChart2, Landmark, Globe, Star, Gem,
  CheckSquare, Zap, Award, BookOpen, RefreshCw, X,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import MagneticButton from '@/components/ui/MagneticButton';
import { CelebrationOverlay } from '@/components/ui/Celebration';
import { useAuth } from '@/lib/AuthContext';
import { formatUGX, formatUGXShort, VIP_LEVELS, getBondsPerDay } from '@/lib/vipData';
import { getWalletBalance, getUserDeposits, getBonusBalance, isBonusWithdrawable } from '@/lib/depositStore';
import { getUserWithdrawals } from '@/lib/withdrawalStore';
import { playSound } from '@/lib/sound';
import { getBondConfig, getBondImages } from '@/lib/investData';
import {
  getActiveBonds, checkAndCreditDailyProfits, getTodaysBondIncome,
  getTotalInvested, getMsUntilNextCredit,
} from '@/lib/bondStore';
import { getTaskFlow, isSalesEligible, activateSalesFlow } from '@/lib/taskFlowStore';
import { syncReferralRewards } from '@/lib/referralStore';

const LEVEL_ICONS = [TrendingUp, BarChart2, Landmark, Globe, Star, Gem, Crown];

function fmtCountdown(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function getCurrentVip(balance) {
  const sorted = [...VIP_LEVELS].sort((a, b) => b.min_investment - a.min_investment);
  return sorted.find((v) => balance >= v.min_investment) ?? VIP_LEVELS[0];
}

function getTaskState() {
  try {
    const raw = localStorage.getItem('bondify_task_state');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ─── DAILY TASKS DASHBOARD ───────────────────────────────────────────────────
function DailyDashboard({ user, displayName }) {
  const navigate = useNavigate();
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [todayCreditAmount, setTodayCreditAmount] = useState(0);
  const [showCreditBanner, setShowCreditBanner] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [salesEligible, setSalesEligible] = useState(false);

  const [stats, setStats] = useState({
    balance: 0, bonus: 0, bonusWithdrawable: false,
    activeBonds: [], todayIncome: 0, totalInvested: 0,
    vip: VIP_LEVELS[0], nextVip: VIP_LEVELS[1], amountNeeded: 0,
  });

  useEffect(() => {
    const key = 'bondify_welcomed';
    if (!sessionStorage.getItem(key)) { sessionStorage.setItem(key, '1'); setCelebrate(true); }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    // Credit daily profits
    const newCredit = checkAndCreditDailyProfits(user.id);
    if (newCredit > 0) { setTodayCreditAmount(newCredit); setShowCreditBanner(true); }

    // Sync referral rewards
    syncReferralRewards(user.id);

    const balance = getWalletBalance();
    const vip = getCurrentVip(balance);
    const vipIdx = VIP_LEVELS.findIndex((v) => v.level === vip.level);
    const nextVip = VIP_LEVELS[vipIdx + 1] ?? null;
    const amountNeeded = nextVip ? Math.max(0, nextVip.min_investment - balance) : 0;
    const activeBonds = getActiveBonds(user.id);
    const todayIncome = getTodaysBondIncome(user.id);
    const totalInvested = getTotalInvested(user.id);
    const bonus = getBonusBalance();
    const bonusWithdrawable = isBonusWithdrawable();

    setStats({ balance, bonus, bonusWithdrawable, activeBonds, todayIncome, totalInvested, vip, nextVip, amountNeeded });
    setSalesEligible(isSalesEligible());
  }, [user?.id]);

  useEffect(() => {
    const update = () => setCountdown(fmtCountdown(getMsUntilNextCredit()));
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  const { balance, bonus, bonusWithdrawable, activeBonds, todayIncome, totalInvested, vip, nextVip, amountNeeded } = stats;

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <CelebrationOverlay
        show={celebrate}
        title={`Welcome to Bondify, ${displayName}!`}
        subtitle="Your account is ready. Start by recharging your wallet."
        onClose={() => setCelebrate(false)}
        autoDismiss={3500}
      />

      {/* Today's credit banner */}
      <AnimatePresence>
        {showCreditBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-2xl bg-emerald-500 text-white p-4 flex items-center gap-3"
          >
            <Sparkles size={20} className="shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-sm">Your bonds earned while you slept!</p>
              <p className="text-white/80 text-xs">+{formatUGX(todayCreditAmount)} added to your balance just now</p>
            </div>
            <button onClick={() => setShowCreditBanner(false)} className="text-white/70 hover:text-white">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sales upgrade banner */}
      {salesEligible && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 p-4">
          <div className="flex items-start gap-3">
            <Zap size={20} className="text-yellow-300 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-white text-sm">You qualify for Sales Trader mode!</p>
              <p className="text-white/75 text-xs mt-0.5">Your account is ready for the advanced earning program — sell bonds and earn UGX 150,000+ per sale.</p>
            </div>
          </div>
          <button
            onClick={() => { activateSalesFlow(); playSound('success'); window.location.reload(); }}
            className="mt-3 w-full py-2.5 rounded-xl bg-white text-violet-700 font-bold text-sm"
          >
            Activate Sales Trader Mode →
          </button>
        </motion.div>
      )}

      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Hey, {displayName} 👋</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your bonds are working for you every day.</p>
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2.5">
        {[
          { label: 'Recharge', icon: RefreshCw, to: '/dashboard/deposit', color: 'text-emerald-500' },
          { label: 'Withdraw', icon: ArrowUpRight, to: '/dashboard/withdrawals', color: 'text-rose-500' },
          { label: 'Daily Gift', icon: Gift, to: '/dashboard/gift', color: 'text-amber-500' },
          { label: 'Check-in', icon: Calendar, to: '/dashboard/gift', color: 'text-sky-500' },
        ].map((a) => (
          <Link key={a.label} to={a.to} onClick={() => playSound('click')}>
            <div className="flex flex-col items-center gap-1.5 py-3 rounded-xl glass hover:bg-muted/40 transition-colors">
              <a.icon size={18} className={a.color} />
              <span className="text-[11px] font-medium text-center leading-tight">{a.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Welcome bonus card */}
      {bonus > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className={`rounded-2xl border p-4 ${bonusWithdrawable ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${bonusWithdrawable ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>🎁</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${bonusWithdrawable ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {bonusWithdrawable ? 'Your UGX 10,000 bonus is ready!' : 'UGX 10,000 Welcome Bonus Waiting'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {bonusWithdrawable
                    ? 'Your welcome bonus has been unlocked. You can withdraw it anytime!'
                    : 'Make your first recharge to unlock your UGX 10,000 welcome bonus immediately.'}
                </p>
              </div>
            </div>
            {bonusWithdrawable && (
              <Link to="/dashboard/withdrawals" onClick={() => playSound('click')}>
                <button className="mt-3 w-full py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold">
                  Withdraw My Bonus →
                </button>
              </Link>
            )}
            {!bonusWithdrawable && (
              <Link to="/dashboard/deposit" onClick={() => playSound('click')}>
                <button className="mt-3 w-full py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold">
                  Recharge to Unlock Bonus →
                </button>
              </Link>
            )}
          </div>
        </motion.div>
      )}

      {/* Stats + Learn/Cert section */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Wallet Balance', value: balance, numeric: true, icon: Wallet, color: 'from-emerald-500 to-teal-600', hide: true },
            { label: "Today's Earnings", value: todayIncome, numeric: true, icon: TrendingUp, color: 'from-green-400 to-emerald-500' },
            { label: 'Active Bonds', value: activeBonds.length, numeric: false, icon: BarChart2, color: 'from-sky-400 to-blue-500', suffix: ' bonds' },
            { label: 'Total Invested', value: totalInvested, numeric: true, icon: Crown, color: 'from-amber-400 to-yellow-500' },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard glow hover className="h-full !p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center shadow`}>
                    <card.icon className="text-white" size={13} />
                  </div>
                  {card.hide && (
                    <button onClick={() => setBalanceHidden((h) => !h)} className="text-muted-foreground">
                      {balanceHidden ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground leading-none">{card.label}</p>
                <p className="text-sm font-bold mt-1 leading-none">
                  {card.hide && balanceHidden ? '••••••' : card.numeric ? formatUGX(card.value) : `${card.value}${card.suffix || ''}`}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* How It Works + Certificate — compact row */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="grid grid-cols-2 gap-2">
          <Link to="/dashboard/learn/daily" onClick={() => playSound('click')}>
            <div className="glass rounded-xl px-3 py-2.5 flex items-center gap-2.5 hover:bg-muted/40 transition-colors">
              <BookOpen size={16} className="text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-none">How It Works</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Daily earning guide</p>
              </div>
            </div>
          </Link>
          <Link to="/dashboard/certificate" onClick={() => playSound('click')}>
            <div className="glass rounded-xl px-3 py-2.5 flex items-center gap-2.5 hover:bg-muted/40 transition-colors">
              <Award size={16} className="text-amber-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-none">My Certificate</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Investor certificate</p>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Active bonds summary */}
      {activeBonds.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="font-bold text-sm">My Active Bonds</h2>
            <span className="text-[11px] text-emerald-400 font-medium">Next credit in {countdown}</span>
          </div>
          <div className="space-y-2">
            {activeBonds.slice(0, 3).map((bond) => (
              <div key={bond.id} className="glass rounded-2xl p-3 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${bond.color || 'from-emerald-500 to-teal-600'} flex items-center justify-center shrink-0`}>
                  <BarChart2 size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{bond.product_name}</p>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min((bond.days_completed / bond.term_days) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Day {bond.days_completed} of {bond.term_days}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-emerald-400">+{formatUGX(bond.daily_income)}</p>
                  <p className="text-[10px] text-muted-foreground">per day</p>
                </div>
              </div>
            ))}
            {activeBonds.length > 3 && (
              <p className="text-xs text-center text-muted-foreground">+{activeBonds.length - 3} more bonds active</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Greed psychology — earnings projection */}
      {activeBonds.length > 0 && todayIncome > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 p-4">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Keep earning — don't stop now</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-[10px] text-muted-foreground">Today</p>
                <p className="text-sm font-black text-emerald-400">{formatUGXShort(todayIncome)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">This Week</p>
                <p className="text-sm font-black text-foreground">{formatUGXShort(todayIncome * 7)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">This Month</p>
                <p className="text-sm font-black text-amber-400">{formatUGXShort(todayIncome * 30)}</p>
              </div>
            </div>
            {nextVip && (
              <p className="text-[11px] text-muted-foreground mt-3 text-center">
                Upgrade to <span className="text-amber-400 font-semibold">{nextVip.name}</span> to earn{' '}
                <span className="text-emerald-400 font-semibold">{formatUGX(amountNeeded)} more balance</span> — unlock bigger daily returns
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Bond Packages section */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-base">Bond Packages</h2>
            <p className="text-[11px] text-muted-foreground">Buy a bond — earn passive income every day</p>
          </div>
          <Link to="/dashboard/invest" onClick={() => playSound('click')} className="text-xs text-emerald-500 font-semibold flex items-center gap-0.5">
            Full view <ChevronRight size={11} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(() => {
            const bonds = getBondConfig();
            const bondImgs = getBondImages();
            return bonds.map((product) => {
              const Icon = LEVEL_ICONS[product.level - 1] ?? TrendingUp;
              const imgSrc = bondImgs[product.id];
              return (
                <div key={product.id} className="glass rounded-2xl border border-border overflow-hidden">
                  {/* Header: image if set, otherwise gradient */}
                  {imgSrc ? (
                    <div className="relative h-20 overflow-hidden">
                      <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-end px-2.5 pb-1.5">
                        <div className="min-w-0">
                          <p className="text-white font-bold text-[11px] truncate leading-tight">{product.name}</p>
                          {product.badge && <span className="text-[9px] text-white/80 font-medium">{product.badge}</span>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`bg-gradient-to-br ${product.color} px-3 py-2.5 flex items-center gap-2`}>
                      <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-bold text-[11px] truncate">{product.name}</p>
                        {product.badge && <span className="text-[9px] text-white/70">{product.badge}</span>}
                      </div>
                    </div>
                  )}
                  <div className="p-2.5 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-muted-foreground">Price</span>
                      <span className="text-[11px] font-bold">{formatUGX(product.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-muted-foreground">Daily Income</span>
                      <span className="text-[11px] font-bold text-emerald-400">{formatUGX(product.daily_income)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-muted-foreground">Cycle</span>
                      <span className="text-[11px] font-bold">{product.term} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-muted-foreground">Total Returns</span>
                      <span className="text-[11px] font-bold text-amber-400">{formatUGX(product.total_income)}</span>
                    </div>
                    <Link to="/dashboard/invest" onClick={() => playSound('click')}>
                      <button className={`w-full mt-1.5 py-1.5 rounded-lg bg-gradient-to-r ${product.color} text-white text-[11px] font-bold`}>
                        Buy Now
                      </button>
                    </Link>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </motion.div>

      {/* VIP Earnings by tier */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <GlassCard hover={false}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" /> Bondify Earnings by Tier
            </h3>
          </div>
          <div className="space-y-1.5">
            {VIP_LEVELS.slice(0, 6).map((v) => {
              const isUser = v.level === getCurrentVip(getWalletBalance()).level;
              return (
                <div key={v.level} className={`flex items-center gap-3 px-3 py-2 rounded-xl ${isUser ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-muted/30'}`}>
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${v.color} flex items-center justify-center shrink-0`}>
                    <span className="text-[9px] font-bold text-white">{v.level}</span>
                  </div>
                  <span className={`text-xs font-medium flex-1 ${isUser ? 'text-foreground' : 'text-muted-foreground'}`}>{v.name}</span>
                  <span className={`text-xs font-bold ${isUser ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                    {formatUGXShort(v.daily_earnings_min)}–{formatUGXShort(v.daily_earnings_max)}<span className="text-[10px] font-normal">/d</span>
                  </span>
                  {isUser && <span className="text-[9px] font-bold text-white bg-emerald-500 px-1.5 py-0.5 rounded-full">YOU</span>}
                </div>
              );
            })}
          </div>
          <Link to="/dashboard/vip" onClick={() => playSound('click')} className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1">
            See all VIP levels <ChevronRight size={12} />
          </Link>
        </GlassCard>
      </motion.div>

    </div>
  );
}

// ─── SALES TASKS DASHBOARD ───────────────────────────────────────────────────
function SalesDashboard({ user, displayName }) {
  const [balanceHidden, setBalanceHidden] = useState(false);

  const [stats, setStats] = useState({
    balance: 0, tasksCompleted: 0, tasksTotal: 3,
    vip: VIP_LEVELS[0], nextVip: VIP_LEVELS[1], amountNeeded: 0,
    pendingWithdrawal: 0,
  });

  useEffect(() => {
    if (!user?.id) return;
    syncReferralRewards(user.id);

    const balance = getWalletBalance();
    const vip = getCurrentVip(balance);
    const vipIdx = VIP_LEVELS.findIndex((v) => v.level === vip.level);
    const nextVip = VIP_LEVELS[vipIdx + 1] ?? null;
    const amountNeeded = nextVip ? Math.max(0, nextVip.min_investment - balance) : 0;

    const taskState = getTaskState();
    const tasksCompleted = taskState?.completedToday ?? 0;
    const tasksTotal = getBondsPerDay(vip.level);

    const withdrawals = getUserWithdrawals(user.id);
    const pendingWithdrawal = withdrawals
      .filter((w) => w.status === 'pending')
      .reduce((s, w) => s + (parseInt(w.amount, 10) || 0), 0);

    setStats({ balance, tasksCompleted, tasksTotal, vip, nextVip, amountNeeded, pendingWithdrawal });
  }, [user?.id]);

  const { balance, tasksCompleted, tasksTotal, vip, nextVip, amountNeeded, pendingWithdrawal } = stats;
  const taskPct = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Header with Sales Trader badge */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold">Hey, {displayName} 👋</h1>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-xs font-semibold text-violet-400">Sales Trader</span>
        </div>
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2.5">
        {[
          { label: 'Recharge', icon: RefreshCw, to: '/dashboard/deposit', color: 'text-emerald-500' },
          { label: 'Withdraw', icon: ArrowUpRight, to: '/dashboard/withdrawals', color: 'text-rose-500' },
          { label: 'Daily Gift', icon: Gift, to: '/dashboard/gift', color: 'text-amber-500' },
          { label: 'My Tasks', icon: CheckSquare, to: '/dashboard/tasks', color: 'text-violet-500' },
        ].map((a) => (
          <Link key={a.label} to={a.to} onClick={() => playSound('click')}>
            <div className="flex flex-col items-center gap-1.5 py-3 rounded-xl glass hover:bg-muted/40 transition-colors">
              <a.icon size={18} className={a.color} />
              <span className="text-[11px] font-medium text-center leading-tight">{a.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats + Learn/Cert section */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Wallet Balance', value: balance, numeric: true, icon: Wallet, color: 'from-emerald-500 to-teal-600', hide: true },
            { label: 'Tasks Today', value: `${tasksCompleted} / ${tasksTotal}`, numeric: false, icon: CheckSquare, color: 'from-violet-400 to-purple-500' },
            { label: 'Current VIP', value: `${vip.level} · ${vip.name}`, numeric: false, icon: Crown, color: 'from-amber-400 to-yellow-500' },
            { label: 'Pending Payout', value: pendingWithdrawal, numeric: true, icon: Clock, color: 'from-rose-400 to-red-500' },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard glow hover className="h-full !p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center shadow`}>
                    <card.icon className="text-white" size={13} />
                  </div>
                  {card.hide && (
                    <button onClick={() => setBalanceHidden((h) => !h)} className="text-muted-foreground">
                      {balanceHidden ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground leading-none">{card.label}</p>
                <p className="text-sm font-bold mt-1 leading-none">
                  {card.hide && balanceHidden ? '••••••' : card.numeric ? formatUGX(card.value) : card.value}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* How It Works + Certificate — compact row */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="grid grid-cols-2 gap-2">
          <Link to="/dashboard/learn/sales" onClick={() => playSound('click')}>
            <div className="glass rounded-xl px-3 py-2.5 flex items-center gap-2.5 hover:bg-muted/40 transition-colors">
              <BookOpen size={16} className="text-violet-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-none">How It Works</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Sales system guide</p>
              </div>
            </div>
          </Link>
          <Link to="/dashboard/certificate" onClick={() => playSound('click')}>
            <div className="glass rounded-xl px-3 py-2.5 flex items-center gap-2.5 hover:bg-muted/40 transition-colors">
              <Award size={16} className="text-amber-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-none">My Certificate</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Investor certificate</p>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Task progress */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard hover={false}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">Today's Bond Sales</p>
            <span className="text-xs font-bold text-violet-400">{tasksCompleted}/{tasksTotal} done</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${taskPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <Link to="/dashboard/tasks" onClick={() => playSound('click')}>
            <button className="w-full mt-3 py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30">
              <CheckSquare size={16} /> Start Selling Bonds
            </button>
          </Link>
        </GlassCard>
      </motion.div>

      {/* VIP Upgrade card */}
      {nextVip && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={15} className="text-violet-400 shrink-0" />
              <p className="text-sm font-semibold">More tasks = more money</p>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              At <span className="text-violet-400 font-semibold">{nextVip.name}</span> you'd get{' '}
              <span className="text-violet-400 font-semibold">more bonds to sell daily</span> — earning up to{' '}
              <span className="text-amber-400 font-semibold">{formatUGX(nextVip.daily_earnings_max)}/day</span>.
            </p>
            <Link to="/dashboard/deposit" onClick={() => playSound('click')}>
              <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold">
                Recharge {amountNeeded > 0 ? formatUGX(amountNeeded) : ''} to Unlock {nextVip.name} <ArrowUpRight size={12} className="inline" />
              </button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* VIP earnings table */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-amber-400" />
            <h3 className="text-sm font-semibold">Earnings by VIP Level</h3>
          </div>
          <div className="space-y-1.5">
            {VIP_LEVELS.slice(0, 6).map((v) => {
              const isUser = v.level === getCurrentVip(balance).level;
              return (
                <div key={v.level} className={`flex items-center gap-3 px-3 py-2 rounded-xl ${isUser ? 'bg-violet-500/10 border border-violet-500/30' : 'bg-muted/30'}`}>
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${v.color} flex items-center justify-center shrink-0`}>
                    <span className="text-[9px] font-bold text-white">{v.level}</span>
                  </div>
                  <span className={`text-xs font-medium flex-1 ${isUser ? 'text-foreground' : 'text-muted-foreground'}`}>{v.name}</span>
                  <span className={`text-xs font-bold ${isUser ? 'text-violet-400' : 'text-muted-foreground'}`}>
                    {formatUGXShort(v.daily_earnings_min)}–{formatUGXShort(v.daily_earnings_max)}<span className="text-[10px] font-normal">/d</span>
                  </span>
                  {isUser && <span className="text-[9px] font-bold text-white bg-violet-500 px-1.5 py-0.5 rounded-full">YOU</span>}
                </div>
              );
            })}
          </div>
        </GlassCard>
      </motion.div>

    </div>
  );
}

// ─── ROOT DASHBOARD ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const taskFlow = getTaskFlow();
  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Trader';

  if (taskFlow === 'sales') return <SalesDashboard user={user} displayName={displayName} />;
  return <DailyDashboard user={user} displayName={displayName} />;
}
