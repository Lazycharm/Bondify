const KEY = 'bondify_deposits';
export const WALLET_KEY = 'bondify_wallet_balance';

export function getDeposits() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function getUserDeposits(userId) {
  return getDeposits().filter((d) => d.userId === userId);
}

export function addDeposit({ userId, userEmail, amount, network, userPhone, userSms }) {
  const deposits = getDeposits();
  const deposit = {
    id: `DEP-${Date.now()}`,
    userId, userEmail, amount, network, userPhone, userSms,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  deposits.unshift(deposit);
  localStorage.setItem(KEY, JSON.stringify(deposits));
  return deposit;
}

export function updateDeposit(id, status) {
  const deposits = getDeposits();
  const idx = deposits.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  deposits[idx] = { ...deposits[idx], status, updated_at: new Date().toISOString() };
  if (status === 'approved') {
    const current = parseInt(localStorage.getItem(WALLET_KEY) || '0', 10);
    localStorage.setItem(WALLET_KEY, String(current + deposits[idx].amount));
  }
  localStorage.setItem(KEY, JSON.stringify(deposits));
  return deposits[idx];
}

export function getWalletBalance() {
  return parseInt(localStorage.getItem(WALLET_KEY) || '0', 10);
}
