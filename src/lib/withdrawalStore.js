import { getWalletBalance } from './depositStore';

const KEY = 'bondify_withdrawals';

export function getWithdrawals() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function getUserWithdrawals(userId) {
  return getWithdrawals().filter((w) => w.userId === userId);
}

export function addWithdrawal({ userId, userEmail, amount, method, account }) {
  const balance = getWalletBalance();
  if (parseInt(amount, 10) > balance) return { error: 'Insufficient balance' };
  const withdrawals = getWithdrawals();
  const wd = {
    id: `WD-${Date.now()}`,
    userId, userEmail,
    amount: parseInt(amount, 10),
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
