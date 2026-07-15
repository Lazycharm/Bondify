import { getWalletBalance, addGiftCredit } from './depositStore';
import { uploadUserBond, uploadAllUserBonds } from './supabase_ops';

const BONDS_KEY = (uid) => `bondify_bonds_${uid}`;
const DEDUCTIONS_KEY = 'bondify_bond_deductions';

export function getUserBonds(userId) {
  try { return JSON.parse(localStorage.getItem(BONDS_KEY(userId)) || '[]'); }
  catch { return []; }
}

export function getActiveBonds(userId) {
  return getUserBonds(userId).filter((b) => b.is_active);
}

export function getTotalBondDeductions() {
  return parseInt(localStorage.getItem(DEDUCTIONS_KEY) || '0', 10) || 0;
}

export function purchaseBond(userId, product) {
  const balance = getWalletBalance();
  if (balance < product.price) return { error: 'Insufficient balance' };

  // Deduct price from wallet via bond deductions key
  const current = getTotalBondDeductions();
  localStorage.setItem(DEDUCTIONS_KEY, String(current + product.price));

  const bond = {
    id: `BOND-${Date.now()}`,
    userId,
    product_id: product.id,
    product_name: product.name,
    color: product.color,
    price: product.price,
    daily_income: product.daily_income,
    total_income: product.total_income,
    term_days: product.term,
    started_at: new Date().toISOString(),
    last_credited_date: new Date().toISOString().split('T')[0],
    total_credited: 0,
    days_completed: 0,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  const bonds = getUserBonds(userId);
  bonds.unshift(bond);
  localStorage.setItem(BONDS_KEY(userId), JSON.stringify(bonds));
  uploadUserBond(bond).catch(() => {});
  return bond;
}

// Called on dashboard load — credits any uncredited daily profits
export function checkAndCreditDailyProfits(userId) {
  const bonds = getUserBonds(userId);
  const today = new Date().toISOString().split('T')[0];
  let totalNewCredit = 0;

  const updated = bonds.map((bond) => {
    if (!bond.is_active) return bond;
    if (bond.last_credited_date >= today) return bond; // already done today
    if (bond.days_completed >= bond.term_days) return { ...bond, is_active: false }; // expired

    totalNewCredit += bond.daily_income;
    return {
      ...bond,
      last_credited_date: today,
      total_credited: bond.total_credited + bond.daily_income,
      days_completed: bond.days_completed + 1,
    };
  });

  localStorage.setItem(BONDS_KEY(userId), JSON.stringify(updated));
  if (totalNewCredit > 0) addGiftCredit(totalNewCredit);
  uploadAllUserBonds(userId, updated).catch(() => {});
  return totalNewCredit;
}

export function getTodaysBondIncome(userId) {
  const today = new Date().toISOString().split('T')[0];
  return getUserBonds(userId)
    .filter((b) => b.is_active && b.last_credited_date === today)
    .reduce((s, b) => s + b.daily_income, 0);
}

export function getTotalBondIncome(userId) {
  return getUserBonds(userId).reduce((s, b) => s + (b.total_credited || 0), 0);
}

export function getTotalInvested(userId) {
  return getUserBonds(userId).reduce((s, b) => s + b.price, 0);
}

// Returns milliseconds until next midnight credit
export function getMsUntilNextCredit() {
  const now = new Date();
  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);
  return next - now;
}
