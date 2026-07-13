const KEY = 'bondify_referrals';
const DEPOSITS_KEY = 'bondify_deposits';

export const COMMISSION_RATES = { 1: 0.035, 2: 0.02, 3: 0.01 };

export function getReferrals() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

// Returns referrals where this user is the referrer
export function getMyReferrals(referrerId) {
  return getReferrals().filter((r) => r.referrerId === referrerId);
}

export function addReferral({ referrerId, referredEmail, referredId }) {
  if (!referrerId || !referredEmail) return;
  const all = getReferrals();
  // Avoid duplicates
  if (all.some((r) => r.referredEmail === referredEmail)) return;
  all.unshift({ referrerId, referredEmail, referredId: referredId || null, joinedAt: new Date().toISOString() });
  localStorage.setItem(KEY, JSON.stringify(all));
}

// Calculate L1 earnings: 3.5% of each referral's approved deposits
export function getL1Earnings(referrerId) {
  const myReferrals = getMyReferrals(referrerId);
  const emails = new Set(myReferrals.map((r) => r.referredEmail));
  if (emails.size === 0) return 0;
  try {
    const deposits = JSON.parse(localStorage.getItem(DEPOSITS_KEY) || '[]');
    return deposits
      .filter((d) => d.status === 'approved' && emails.has(d.userEmail))
      .reduce((s, d) => s + parseInt(d.amount, 10) * COMMISSION_RATES[1], 0);
  } catch { return 0; }
}

export function getReferralLink(userId) {
  if (!userId) return '';
  return `${window.location.origin}/register?ref=${userId.slice(0, 8)}`;
}

// Store the referrer code when user visits with ?ref=
export function storeRefCode(code) {
  if (code) sessionStorage.setItem('bondify_ref_code', code);
}

export function getStoredRefCode() {
  return sessionStorage.getItem('bondify_ref_code');
}

export function clearRefCode() {
  sessionStorage.removeItem('bondify_ref_code');
}
