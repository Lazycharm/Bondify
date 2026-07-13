import { getWalletBalance, WALLET_KEY } from './depositStore';

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
  if (amount > balance) return { error: 'Insufficient balance' };
  const withdrawals = getWithdrawals();
  const wd = {
    id: `WD-${Date.now()}`,
    userId, userEmail, amount, method, account,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  withdrawals.unshift(wd);
  localStorage.setItem(WALLET_KEY, String(balance - amount));
  localStorage.setItem(KEY, JSON.stringify(withdrawals));
  return wd;
}

export function updateWithdrawal(id, status) {
  const withdrawals = getWithdrawals();
  const idx = withdrawals.findIndex((w) => w.id === id);
  if (idx === -1) return null;
  withdrawals[idx] = { ...withdrawals[idx], status, updated_at: new Date().toISOString() };
  if (status === 'rejected') {
    const current = parseInt(localStorage.getItem(WALLET_KEY) || '0', 10);
    localStorage.setItem(WALLET_KEY, String(current + withdrawals[idx].amount));
  }
  localStorage.setItem(KEY, JSON.stringify(withdrawals));
  return withdrawals[idx];
}
