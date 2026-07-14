/**
 * supabase_ops.js — Supabase operations for cross-device data.
 * Deposits, withdrawals, platform config, and referrals all go through
 * Supabase so every device sees the same state.
 * localStorage is used as a cache / fallback for fast initial render.
 */
import { supabase } from '@/api/supabaseClient';

const SETTINGS_KEY    = 'bondify_payment_settings';
const DEPOSITS_KEY    = 'bondify_deposits';
const WITHDRAWALS_KEY = 'bondify_withdrawals';
const REFERRALS_KEY   = 'bondify_referrals';

// Network value mappings between frontend codes and Supabase constraint values
const NET_TO_DB  = { mtn: 'MTN Mobile Money', airtel: 'Airtel Money', bank: 'Bank Transfer' };
const NET_FROM_DB = { 'MTN Mobile Money': 'mtn', 'Airtel Money': 'airtel', 'Bank Transfer': 'bank' };

// ── PLATFORM CONFIG ──────────────────────────────────────────────────────────

export async function loadPlatformConfigFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('platform_config')
      .select('*')
      .eq('id', 1)
      .single();
    if (error || !data) return null;

    const settings = {
      mtn_number:            data.mtn_number            || '',
      mtn_name:              data.mtn_name              || '',
      airtel_number:         data.airtel_number         || '',
      airtel_name:           data.airtel_name           || '',
      telegram_token:        data.telegram_token        || '',
      telegram_chat_id:      data.telegram_chat_id      || '',
      admin_emails:          Array.isArray(data.admin_emails)
                               ? data.admin_emails.join(', ')
                               : (data.admin_emails || ''),
      support_telegram_link: data.support_telegram_link || '',
      withdrawal_fee_pct:    data.withdrawal_fee_pct    || '0',
      withdrawal_min_amount: data.withdrawal_min_amount || '10000',
      withdrawal_max_amount: data.withdrawal_max_amount || '0',
      daily_lock_hrs:        data.daily_lock_hrs        || '24',
      sales_lock_days:       data.sales_lock_days       || '30',
      daily_deposit_min:     data.daily_deposit_min     || '20000',
      daily_deposit_max:     data.daily_deposit_max     || '0',
      sales_deposit_min:     data.sales_deposit_min     || '20000',
      sales_deposit_max:     data.sales_deposit_max     || '0',
      referral_lv1:          data.referral_lv1          || '5',
      referral_lv2:          data.referral_lv2          || '2',
      referral_lv3:          data.referral_lv3          || '1',
      daily_gift_amount:     data.daily_gift_amount     || '1000',
    };

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return settings;
  } catch {
    return null;
  }
}

export async function savePlatformConfigToSupabase(settings) {
  const adminEmailsArr = settings.admin_emails
    ? settings.admin_emails.split(',').map((e) => e.trim()).filter(Boolean)
    : [];

  const { error } = await supabase.from('platform_config').upsert({
    id:                    1,
    mtn_number:            settings.mtn_number            || '',
    mtn_name:              settings.mtn_name              || '',
    airtel_number:         settings.airtel_number         || '',
    airtel_name:           settings.airtel_name           || '',
    telegram_token:        settings.telegram_token        || '',
    telegram_chat_id:      settings.telegram_chat_id      || '',
    admin_emails:          adminEmailsArr,
    support_telegram_link: settings.support_telegram_link || '',
    withdrawal_fee_pct:    settings.withdrawal_fee_pct    || '0',
    withdrawal_min_amount: settings.withdrawal_min_amount || '10000',
    withdrawal_max_amount: settings.withdrawal_max_amount || '0',
    daily_lock_hrs:        settings.daily_lock_hrs        || '24',
    sales_lock_days:       settings.sales_lock_days       || '30',
    daily_deposit_min:     settings.daily_deposit_min     || '20000',
    daily_deposit_max:     settings.daily_deposit_max     || '0',
    sales_deposit_min:     settings.sales_deposit_min     || '20000',
    sales_deposit_max:     settings.sales_deposit_max     || '0',
    referral_lv1:          settings.referral_lv1          || '5',
    referral_lv2:          settings.referral_lv2          || '2',
    referral_lv3:          settings.referral_lv3          || '1',
    daily_gift_amount:     settings.daily_gift_amount     || '1000',
    updated_at:            new Date().toISOString(),
  });

  if (error) throw error;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ── DEPOSITS ─────────────────────────────────────────────────────────────────

function mapDepositFromDb(d) {
  return {
    id:         d.id,
    userId:     d.user_id,
    userEmail:  d.user_email,
    amount:     parseInt(d.amount, 10),
    network:    NET_FROM_DB[d.network] || d.network?.toLowerCase() || '',
    userSms:    d.payment_ref || '',
    status:     d.status,
    created_at: d.created_at,
  };
}

export async function saveDepositToSupabase({ userId, userEmail, amount, network, userSms, userPhone }) {
  const { data, error } = await supabase
    .from('deposits')
    .insert({
      user_id:     userId,
      user_email:  userEmail,
      amount:      parseInt(amount, 10),
      network:     NET_TO_DB[network] || network,
      payment_ref: userSms || userPhone || '',
      status:      'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return mapDepositFromDb(data);
}

export async function syncUserDeposits(userId) {
  const { data, error } = await supabase
    .from('deposits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return null;

  const mapped = data.map(mapDepositFromDb);

  // Update localStorage: replace this user's records with Supabase truth
  let local = [];
  try { local = JSON.parse(localStorage.getItem(DEPOSITS_KEY) || '[]'); } catch {}
  const others = local.filter((d) => d.userId !== userId);
  localStorage.setItem(DEPOSITS_KEY, JSON.stringify([...mapped, ...others]));

  // Side effects: apply welcome bonus and sales eligibility based on approved deposits
  const approvedDeposits = mapped.filter((d) => d.status === 'approved');
  if (approvedDeposits.length > 0 && !localStorage.getItem('bondify_bonus_given')) {
    localStorage.setItem('bondify_bonus_given', '1');
    localStorage.setItem('bondify_bonus_balance', '10000');
    localStorage.setItem('bondify_bonus_withdrawable', '1');
  }
  const hasSalesDeposit = approvedDeposits.some((d) => (parseInt(d.amount, 10) || 0) >= 250000);
  if (hasSalesDeposit) localStorage.setItem('bondify_sales_eligible', '1');

  return mapped;
}

export async function getAllDepositsFromSupabase() {
  const { data, error } = await supabase
    .from('deposits')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDepositFromDb);
}

export async function updateDepositInSupabase(id, status) {
  const { data, error } = await supabase
    .from('deposits')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapDepositFromDb(data);
}

// ── WITHDRAWALS ───────────────────────────────────────────────────────────────

function mapWithdrawalFromDb(w) {
  const methodMap = { 'MTN Mobile Money': 'mtn', 'Airtel Money': 'airtel', 'Bank Transfer': 'bank' };
  return {
    id:         w.id,
    userId:     w.user_id,
    userEmail:  w.user_email,
    amount:     parseInt(w.amount, 10),
    method:     methodMap[w.method] || w.method?.toLowerCase() || '',
    account:    w.account || '',
    status:     w.status,
    created_at: w.created_at,
  };
}

export async function saveWithdrawalToSupabase({ userId, userEmail, amount, method, account }) {
  const methodMap = { mtn: 'MTN Mobile Money', airtel: 'Airtel Money', bank: 'Bank Transfer' };
  const { data, error } = await supabase
    .from('withdrawals')
    .insert({
      user_id:    userId,
      user_email: userEmail,
      amount:     parseInt(amount, 10),
      method:     methodMap[method] || method,
      account,
      status:     'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return mapWithdrawalFromDb(data);
}

export async function syncUserWithdrawals(userId) {
  const { data, error } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return null;

  const mapped = data.map(mapWithdrawalFromDb);

  let local = [];
  try { local = JSON.parse(localStorage.getItem(WITHDRAWALS_KEY) || '[]'); } catch {}
  const others = local.filter((w) => w.userId !== userId);
  localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify([...mapped, ...others]));
  return mapped;
}

export async function getAllWithdrawalsFromSupabase() {
  const { data, error } = await supabase
    .from('withdrawals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapWithdrawalFromDb);
}

export async function updateWithdrawalInSupabase(id, status) {
  const { data, error } = await supabase
    .from('withdrawals')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapWithdrawalFromDb(data);
}

// ── REFERRALS ─────────────────────────────────────────────────────────────────

export async function saveReferralToSupabase({ referrerId, referredEmail, referredUserId }) {
  if (!referrerId || !referredEmail) return;
  await supabase.from('referrals').insert({
    referrer_id:      referrerId.toUpperCase(),
    referred_user_id: referredUserId || null,
    referred_email:   referredEmail,
    level:            1,
  });
  // Ignore errors (duplicate entries etc.)
}

export async function syncUserReferrals(userId) {
  const referrerId = userId.slice(0, 8).toUpperCase();
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', referrerId);

  if (error || !data) return;

  const mapped = data.map((r) => ({
    referrerId:     r.referrer_id,
    referredEmail:  r.referred_email,
    referredId:     r.referred_user_id,
    joinedAt:       r.created_at,
  }));

  // Merge with local (avoid duplicates by email)
  let local = [];
  try { local = JSON.parse(localStorage.getItem(REFERRALS_KEY) || '[]'); } catch {}
  const localEmails = new Set(mapped.map((r) => r.referredEmail?.toLowerCase()));
  const localOnly = local.filter((r) => !localEmails.has(r.referredEmail?.toLowerCase()));
  localStorage.setItem(REFERRALS_KEY, JSON.stringify([...mapped, ...localOnly]));
}

// ── WALLET DATA (gift credits + bond deductions) ──────────────────────────────

export async function syncWalletData(userId) {
  try {
    const { data, error } = await supabase
      .from('user_wallets')
      .select('gift_credits, bond_deductions')
      .eq('user_id', userId)
      .single();

    if (error || !data) return;
    localStorage.setItem('bondify_gift_credits', String(data.gift_credits || 0));
    localStorage.setItem('bondify_bond_deductions', String(data.bond_deductions || 0));
  } catch { /* ignore */ }
}

export async function uploadWalletData(userId) {
  if (!userId) return;
  const giftCredits = parseInt(localStorage.getItem('bondify_gift_credits') || '0', 10) || 0;
  const bondDeductions = parseInt(localStorage.getItem('bondify_bond_deductions') || '0', 10) || 0;
  try {
    await supabase.from('user_wallets').upsert({
      user_id: userId,
      gift_credits: giftCredits,
      bond_deductions: bondDeductions,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  } catch { /* ignore */ }
}

// ── SYNC ALL USER DATA ────────────────────────────────────────────────────────

export async function syncAllUserData(userId) {
  if (!userId) return [];
  return Promise.all([
    syncUserDeposits(userId),
    syncUserWithdrawals(userId),
    syncUserReferrals(userId),
    syncWalletData(userId),
  ]);
}
