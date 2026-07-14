import { getDeposits, addGiftCredit } from './depositStore';
import { getPaymentSettings } from './paymentSettings';

const KEY = 'bondify_referrals';

// Default commission rates — overridable from admin settings
export const DEFAULT_RATES = { 1: 0.05, 2: 0.02, 3: 0.01 };

export function getCommissionRates() {
  const s = getPaymentSettings();
  return {
    1: parseFloat(s.referral_lv1 || '5') / 100,
    2: parseFloat(s.referral_lv2 || '2') / 100,
    3: parseFloat(s.referral_lv3 || '1') / 100,
  };
}

export function getReferrals() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function getMyReferralCode(userId) {
  if (!userId) return '';
  return userId.slice(0, 8).toUpperCase();
}

export function getMyReferrals(userId) {
  const code = getMyReferralCode(userId);
  return getReferrals().filter((r) => r.referrerId === code);
}

export function addReferral({ referrerId, referredEmail, referredId }) {
  if (!referrerId || !referredEmail) return;
  const all = getReferrals();
  if (all.some((r) => r.referredEmail?.toLowerCase() === referredEmail.toLowerCase())) return;
  all.unshift({
    referrerId: referrerId.toUpperCase(),
    referredEmail,
    referredId: referredId || null,
    joinedAt: new Date().toISOString(),
  });
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getReferralLink(userId) {
  if (!userId) return '';
  const code = getMyReferralCode(userId);
  return `${window.location.origin}/register?ref=${code}`;
}

// Calculate what user has already been credited for referrals
function getCreditedKey(userId) { return `bondify_ref_credited_${userId}`; }

export function getAlreadyCreditedReferral(userId) {
  return parseInt(localStorage.getItem(getCreditedKey(userId)) || '0', 10) || 0;
}

// Calculate total earned from ALL levels
export function calcReferralEarnings(userId) {
  const rates = getCommissionRates();
  const allReferrals = getReferrals();
  const myCode = getMyReferralCode(userId);
  const deposits = getDeposits().filter((d) => d.status === 'approved');

  // LV1: my direct referrals
  const lv1 = allReferrals.filter((r) => r.referrerId === myCode);
  const lv1Emails = new Set(lv1.map((r) => r.referredEmail?.toLowerCase()));
  const lv1Earned = deposits
    .filter((d) => lv1Emails.has(d.userEmail?.toLowerCase()))
    .reduce((s, d) => s + (parseInt(d.amount, 10) || 0) * rates[1], 0);

  // LV2: referrals of my referrals
  const lv1Ids = lv1.filter((r) => r.referredId).map((r) => r.referredId.slice(0, 8).toUpperCase());
  const lv2 = allReferrals.filter((r) => lv1Ids.includes(r.referrerId));
  const lv2Emails = new Set(lv2.map((r) => r.referredEmail?.toLowerCase()));
  const lv2Earned = deposits
    .filter((d) => lv2Emails.has(d.userEmail?.toLowerCase()))
    .reduce((s, d) => s + (parseInt(d.amount, 10) || 0) * rates[2], 0);

  // LV3: referrals of LV2
  const lv2Ids = lv2.filter((r) => r.referredId).map((r) => r.referredId.slice(0, 8).toUpperCase());
  const lv3 = allReferrals.filter((r) => lv2Ids.includes(r.referrerId));
  const lv3Emails = new Set(lv3.map((r) => r.referredEmail?.toLowerCase()));
  const lv3Earned = deposits
    .filter((d) => lv3Emails.has(d.userEmail?.toLowerCase()))
    .reduce((s, d) => s + (parseInt(d.amount, 10) || 0) * rates[3], 0);

  return {
    lv1: { count: lv1.length, earned: Math.floor(lv1Earned) },
    lv2: { count: lv2.length, earned: Math.floor(lv2Earned) },
    lv3: { count: lv3.length, earned: Math.floor(lv3Earned) },
    total: Math.floor(lv1Earned + lv2Earned + lv3Earned),
  };
}

// Called on dashboard load — credits any new referral earnings
export function syncReferralRewards(userId) {
  const { total } = calcReferralEarnings(userId);
  const already = getAlreadyCreditedReferral(userId);
  const newEarnings = total - already;
  if (newEarnings > 0) {
    addGiftCredit(newEarnings);
    localStorage.setItem(getCreditedKey(userId), String(total));
  }
  return newEarnings;
}

// Store ref code from URL when user visits register page
export function storeRefCode(code) {
  if (code) sessionStorage.setItem('bondify_ref_code', code.toUpperCase());
}

export function getStoredRefCode() {
  return sessionStorage.getItem('bondify_ref_code');
}

export function clearRefCode() {
  sessionStorage.removeItem('bondify_ref_code');
}
