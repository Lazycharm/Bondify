const KEY = 'bondify_deposits';
export const WALLET_KEY = 'bondify_wallet_balance';
const BONUS_KEY = 'bondify_bonus_balance';
const BONUS_GIVEN_KEY = 'bondify_bonus_given';
const BONUS_WITHDRAWABLE_KEY = 'bondify_bonus_withdrawable';

export const FIRST_DEPOSIT_BONUS = 10000;

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
    // Award first-deposit bonus once
    if (!localStorage.getItem(BONUS_GIVEN_KEY)) {
      localStorage.setItem(BONUS_GIVEN_KEY, '1');
      localStorage.setItem(BONUS_KEY, String(FIRST_DEPOSIT_BONUS));
    }
  }
  localStorage.setItem(KEY, JSON.stringify(deposits));
  return deposits[idx];
}

export function getWalletBalance() {
  return parseInt(localStorage.getItem(WALLET_KEY) || '0', 10);
}

export function getBonusBalance() {
  return parseInt(localStorage.getItem(BONUS_KEY) || '0', 10);
}

export function isBonusWithdrawable() {
  return localStorage.getItem(BONUS_WITHDRAWABLE_KEY) === '1';
}

export function unlockBonusWithdrawal() {
  localStorage.setItem(BONUS_WITHDRAWABLE_KEY, '1');
}
