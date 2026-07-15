/**
 * supabase_ops.js — Supabase operations for cross-device data.
 * All writes go to Supabase first. localStorage is a read-cache only.
 */
import { supabase } from '@/api/supabaseClient';
import { getPaymentSettings } from '@/lib/paymentSettings';

const SETTINGS_KEY    = 'bondify_payment_settings';
const DEPOSITS_KEY    = 'bondify_deposits';
const WITHDRAWALS_KEY = 'bondify_withdrawals';
const REFERRALS_KEY   = 'bondify_referrals';

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
    if (error) { console.error('[Supabase] loadPlatformConfig:', error.message); return null; }
    if (!data) return null;

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
  } catch (e) {
    console.error('[Supabase] loadPlatformConfig exception:', e);
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

  if (error) { console.error('[Supabase] savePlatformConfig:', error.message); throw error; }
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

  if (error) { console.error('[Supabase] saveDeposit:', error.message, error); throw error; }
  return mapDepositFromDb(data);
}

export async function syncUserDeposits(userId) {
  try {
    const { data, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) { console.error('[Supabase] syncUserDeposits:', error.message); return null; }

    const mapped = data.map(mapDepositFromDb);

    let local = [];
    try { local = JSON.parse(localStorage.getItem(DEPOSITS_KEY) || '[]'); } catch {}
    const others = local.filter((d) => d.userId !== userId);
    localStorage.setItem(DEPOSITS_KEY, JSON.stringify([...mapped, ...others]));

    const approvedDeposits = mapped.filter((d) => d.status === 'approved');
    if (approvedDeposits.length > 0 && !localStorage.getItem('bondify_bonus_given')) {
      localStorage.setItem('bondify_bonus_given', '1');
      localStorage.setItem('bondify_bonus_balance', '10000');
      localStorage.setItem('bondify_bonus_withdrawable', '1');
    }
    const hasSalesDeposit = approvedDeposits.some((d) => (parseInt(d.amount, 10) || 0) >= 250000);
    if (hasSalesDeposit) localStorage.setItem('bondify_sales_eligible', '1');

    return mapped;
  } catch (e) {
    console.error('[Supabase] syncUserDeposits exception:', e);
    return null;
  }
}

export async function getAllDepositsFromSupabase() {
  const { data, error } = await supabase
    .from('deposits')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error('[Supabase] getAllDeposits:', error.message); throw error; }
  return (data || []).map(mapDepositFromDb);
}

export async function updateDepositInSupabase(id, status) {
  const { data, error } = await supabase
    .from('deposits')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) { console.error('[Supabase] updateDeposit:', error.message); throw error; }
  const deposit = mapDepositFromDb(data);

  if (status === 'approved') {
    creditReferralCommission(deposit).catch((e) =>
      console.error('[Supabase] creditReferralCommission:', e.message)
    );
  }

  return deposit;
}

async function creditReferralCommission(deposit) {
  if (!deposit.userEmail || !deposit.amount) return;

  // Find who referred this depositor at LV1
  const { data: refs } = await supabase
    .from('referrals')
    .select('referrer_id')
    .eq('referred_email', deposit.userEmail.toLowerCase())
    .eq('level', 1)
    .limit(1);

  if (!refs?.length) return;

  const s = getPaymentSettings();
  const lv1Rate = parseFloat(s.referral_lv1 || '5') / 100;
  const commission = Math.floor(deposit.amount * lv1Rate);
  if (commission <= 0) return;

  await supabase.rpc('credit_referral_commission', {
    p_code:   refs[0].referrer_id,
    p_amount: commission,
  });
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

  if (error) { console.error('[Supabase] saveWithdrawal:', error.message, error); throw error; }
  return mapWithdrawalFromDb(data);
}

export async function syncUserWithdrawals(userId) {
  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) { console.error('[Supabase] syncUserWithdrawals:', error.message); return null; }

    const mapped = data.map(mapWithdrawalFromDb);
    let local = [];
    try { local = JSON.parse(localStorage.getItem(WITHDRAWALS_KEY) || '[]'); } catch {}
    const others = local.filter((w) => w.userId !== userId);
    localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify([...mapped, ...others]));
    return mapped;
  } catch (e) {
    console.error('[Supabase] syncUserWithdrawals exception:', e);
    return null;
  }
}

export async function getAllWithdrawalsFromSupabase() {
  const { data, error } = await supabase
    .from('withdrawals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error('[Supabase] getAllWithdrawals:', error.message); throw error; }
  return (data || []).map(mapWithdrawalFromDb);
}

export async function updateWithdrawalInSupabase(id, status) {
  const { data, error } = await supabase
    .from('withdrawals')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) { console.error('[Supabase] updateWithdrawal:', error.message); throw error; }
  return mapWithdrawalFromDb(data);
}

// ── REFERRALS ─────────────────────────────────────────────────────────────────

export async function saveReferralToSupabase({ referrerId, referredEmail, referredUserId }) {
  if (!referrerId || !referredEmail) return;
  const { error } = await supabase.from('referrals').insert({
    referrer_id:      referrerId.toUpperCase(),
    referred_user_id: referredUserId || null,
    referred_email:   referredEmail,
    level:            1,
  });
  if (error) console.error('[Supabase] saveReferral:', error.message);
}

export async function syncUserReferrals(userId) {
  try {
    const referrerId = userId.slice(0, 8).toUpperCase();
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', referrerId);

    if (error) { console.error('[Supabase] syncUserReferrals:', error.message); return; }

    const mapped = data.map((r) => ({
      referrerId:    r.referrer_id,
      referredEmail: r.referred_email,
      referredId:    r.referred_user_id,
      joinedAt:      r.created_at,
    }));

    let local = [];
    try { local = JSON.parse(localStorage.getItem(REFERRALS_KEY) || '[]'); } catch {}
    const localEmails = new Set(mapped.map((r) => r.referredEmail?.toLowerCase()));
    const localOnly = local.filter((r) => !localEmails.has(r.referredEmail?.toLowerCase()));
    localStorage.setItem(REFERRALS_KEY, JSON.stringify([...mapped, ...localOnly]));
  } catch (e) {
    console.error('[Supabase] syncUserReferrals exception:', e);
  }
}

// ── WALLET DATA (gift credits + bond deductions) ──────────────────────────────

export async function syncWalletData(userId) {
  try {
    // maybeSingle() returns null (not an error) when 0 rows — avoids 406 in console for new users
    const { data, error } = await supabase
      .from('user_wallets')
      .select('gift_credits, bond_deductions')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) { console.error('[Supabase] syncWalletData:', error.message); return; }
    if (!data) return;
    localStorage.setItem('bondify_gift_credits', String(data.gift_credits || 0));
    localStorage.setItem('bondify_bond_deductions', String(data.bond_deductions || 0));
  } catch (e) {
    console.error('[Supabase] syncWalletData exception:', e);
  }
}

export async function uploadWalletData(userId) {
  if (!userId) return;
  const giftCredits    = parseInt(localStorage.getItem('bondify_gift_credits')    || '0', 10) || 0;
  const bondDeductions = parseInt(localStorage.getItem('bondify_bond_deductions') || '0', 10) || 0;
  try {
    const { error } = await supabase.from('user_wallets').upsert({
      user_id:         userId,
      gift_credits:    giftCredits,
      bond_deductions: bondDeductions,
      updated_at:      new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (error) console.error('[Supabase] uploadWalletData:', error.message);
  } catch (e) {
    console.error('[Supabase] uploadWalletData exception:', e);
  }
}

// ── REFERRAL EARNINGS ─────────────────────────────────────────────────────────

export async function syncReferralEarnings(userId) {
  if (!userId) return 0;
  const code = userId.slice(0, 8).toUpperCase();
  try {
    const { data } = await supabase
      .from('referral_earnings')
      .select('total_earned')
      .eq('referrer_code', code)
      .maybeSingle();
    const earned = data?.total_earned || 0;
    localStorage.setItem('bondify_referral_earnings', String(earned));
    return earned;
  } catch (e) {
    console.error('[Supabase] syncReferralEarnings:', e);
    return 0;
  }
}

// ── SYNC ALL USER DATA ────────────────────────────────────────────────────────

export async function syncAllUserData(userId) {
  if (!userId) return [];
  return Promise.all([
    syncUserDeposits(userId),
    syncUserWithdrawals(userId),
    syncUserReferrals(userId),
    syncWalletData(userId),
    syncReferralEarnings(userId),
  ]);
}
