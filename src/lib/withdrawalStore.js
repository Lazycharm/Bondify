import { getWalletBalance } from './depositStore';
import { getPaymentSettings } from './paymentSettings';

const KEY = 'bondify_withdrawals';

export function getWithdrawals() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function getUserWithdrawals(userId) {
  return getWithdrawals().filter((w) => w.userId === userId);
}

export function getWithdrawalLimits() {
  const s = getPaymentSettings();
  return {
    min: parseInt(s.withdrawal_min_amount || '10000', 10) || 10000,
    max: parseInt(s.withdrawal_max_amount || '0', 10) || 0,
  };
}

export function getWithdrawalFeePct() {
  const { withdrawal_fee_pct = '0' } = getPaymentSettings();
  return Math.max(0, Math.min(100, parseFloat(withdrawal_fee_pct) || 0));
}

export function calcFee(amount) {
  const pct = getWithdrawalFeePct();
  const fee = Math.round(amount * pct / 100);
  return { fee, net: amount - fee, pct };
}

// { locked, reason, unlockAt (ISO | null) }
export function getWithdrawalLockStatus() {
  const settings = getPaymentSettings();
  const flow = localStorage.getItem('bondify_task_flow') || 'daily';

  if (flow === 'sales') {
    const lockDays = parseInt(settings.sales_lock_days || '30', 10);
    const activatedAt = localStorage.getItem('bondify_sales_activated_at');
    if (!activatedAt) return { locked: false, reason: '', unlockAt: null };
    const unlockAt = new Date(activatedAt);
    unlockAt.setDate(unlockAt.getDate() + lockDays);
    if (Date.now() < unlockAt.getTime()) {
      return {
        locked: true,
        reason: `Sales contract — ${lockDays}-day lock from activation`,
        unlockAt: unlockAt.toISOString(),
      };
    }
    return { locked: false, reason: '', unlockAt: null };
  }

  // Daily flow
  const lockHrs = parseInt(settings.daily_lock_hrs || '24', 10);
  let deposits = [];
  try { deposits = JSON.parse(localStorage.getItem('bondify_deposits') || '[]'); } catch { /* */ }
  const approved = deposits.filter((d) => d.status === 'approved');
  if (approved.length === 0) return { locked: false, reason: '', unlockAt: null };

  const earliest = [...approved].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];
  const unlockAt = new Date(earliest.created_at);
  unlockAt.setHours(unlockAt.getHours() + lockHrs);

  if (Date.now() < unlockAt.getTime()) {
    return {
      locked: true,
      reason: `${lockHrs}-hour lock from first deposit`,
      unlockAt: unlockAt.toISOString(),
    };
  }
  return { locked: false, reason: '', unlockAt: null };
}

export function addWithdrawal({ userId, userEmail, amount, method, account, bypassLock = false }) {
  if (!bypassLock) {
    const { locked, reason } = getWithdrawalLockStatus();
    if (locked) return { error: reason };
  }

  const balance = getWalletBalance();
  const amt = parseInt(amount, 10);
  const { min, max } = getWithdrawalLimits();
  if (min > 0 && amt < min) return { error: `Minimum withdrawal is UGX ${min.toLocaleString()}` };
  if (max > 0 && amt > max) return { error: `Maximum withdrawal is UGX ${max.toLocaleString()}` };
  if (amt > balance) return { error: 'Insufficient balance' };

  const { fee, net } = calcFee(amt);

  const withdrawals = getWithdrawals();
  const wd = {
    id: `WD-${Date.now()}`,
    userId, userEmail,
    amount: amt,
    fee,
    net_amount: net,
    method, account,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  withdrawals.unshift(wd);
  localStorage.setItem(KEY, JSON.stringify(withdrawals));
  return wd;
}

export function updateWithdrawal(id, status) {
  const withdrawals = getWithdrawals();
  const idx = withdrawals.findIndex((w) => w.id === id);
  if (idx === -1) return null;
  withdrawals[idx] = { ...withdrawals[idx], status, updated_at: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(withdrawals));
  return withdrawals[idx];
}
