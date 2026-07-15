const KEY = 'bondify_deposits';
const BONUS_KEY = 'bondify_bonus_balance';
const BONUS_GIVEN_KEY = 'bondify_bonus_given';
const BONUS_WITHDRAWABLE_KEY = 'bondify_bonus_withdrawable';
const WITHDRAWALS_KEY = 'bondify_withdrawals';
const GIFT_KEY = 'bondify_gift_credits';
const BOND_DEDUCTIONS_KEY = 'bondify_bond_deductions';

export const FIRST_DEPOSIT_BONUS = 10000;

export function getDeposits() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function getUserDeposits(userId) {
  return getDeposits().filter((d) => d.userId === userId);
}

export function addDeposit({ userId, userEmail, amount, network, userPhone, userSms, upgradeToSales }) {
  const deposits = getDeposits();
  const deposit = {
    id: `DEP-${Date.now()}`,
    userId, userEmail,
    amount: parseInt(amount, 10),
    network, userPhone, userSms,
    upgradeToSales: upgradeToSales || false,
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
    // Grant welcome bonus on very first approved deposit
    if (!localStorage.getItem(BONUS_GIVEN_KEY)) {
      localStorage.setItem(BONUS_GIVEN_KEY, '1');
      localStorage.setItem(BONUS_KEY, String(FIRST_DEPOSIT_BONUS));
      // Bonus is immediately withdrawable after first deposit
      localStorage.setItem(BONUS_WITHDRAWABLE_KEY, '1');
    }
    // If this is a sales upgrade deposit (>= 250k), mark eligible
    if ((parseInt(deposits[idx].amount, 10) || 0) >= 250000) {
      localStorage.setItem('bondify_sales_eligible', '1');
    }
  }

  localStorage.setItem(KEY, JSON.stringify(deposits));
  return deposits[idx];
}

export function getWalletBalance() {
  const deposited = getDeposits()
    .filter((d) => d.status === 'approved')
    .reduce((s, d) => s + (parseInt(d.amount, 10) || 0), 0);

  const gifts = parseInt(localStorage.getItem(GIFT_KEY) || '0', 10) || 0;
  const bonus = parseInt(localStorage.getItem(BONUS_KEY) || '0', 10) || 0;

  let withdrawn = 0;
  try {
    const wds = JSON.parse(localStorage.getItem(WITHDRAWALS_KEY) || '[]');
    withdrawn = wds
      .filter((w) => w.status !== 'rejected')
      .reduce((s, w) => s + (parseInt(w.amount, 10) || 0), 0);
  } catch { /* */ }

  const bondDeductions = parseInt(localStorage.getItem(BOND_DEDUCTIONS_KEY) || '0', 10) || 0;

  return Math.max(0, deposited + gifts + bonus - withdrawn - bondDeductions);
}

export function addGiftCredit(amount) {
  const toAdd = parseInt(amount, 10) || 0;
  if (toAdd === 0) return;
  const current = parseInt(localStorage.getItem(GIFT_KEY) || '0', 10) || 0;
  localStorage.setItem(GIFT_KEY, String(current + toAdd));
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
