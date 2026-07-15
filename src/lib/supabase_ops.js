/**
 * supabase_ops.js — Supabase operations for cross-device data.
 * All writes go to Supabase first. localStorage is a read-cache only.
 */
import { supabase } from '@/api/supabaseClient';
import { getPaymentSettings } from '@/lib/paymentSettings';
import { getBondConfig, saveBondConfig } from '@/lib/investData';

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

    // Sync bond packages to localStorage so all devices see admin changes
    if (Array.isArray(data.bond_packages) && data.bond_packages.length > 0) {
      saveBondConfig(data.bond_packages);
    }

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
      first_deposit_bonus:   data.first_deposit_bonus   || '5000',
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
    first_deposit_bonus:   settings.first_deposit_bonus   || '5000',
    bond_packages:         settings.bond_packages         || null,
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
      const bonusAmt = parseInt(getPaymentSettings().first_deposit_bonus || '5000', 10) || 5000;
      localStorage.setItem('bondify_bonus_balance', String(bonusAmt));
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
    const { data, error } = await supabase
      .from('user_wallets')
      .select('gift_credits, bond_deductions')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) { console.error('[Supabase] syncWalletData:', error.message); return; }
    if (!data) return;
    // gift_credits = admin-granted credits only; stored in separate key to avoid
    // overwriting bond income accumulated in bondify_gift_credits
    localStorage.setItem('bondify_admin_gifts', String(data.gift_credits || 0));
    localStorage.setItem('bondify_bond_deductions', String(data.bond_deductions || 0));
  } catch (e) {
    console.error('[Supabase] syncWalletData exception:', e);
  }
}

export async function uploadWalletData(userId) {
  if (!userId) return;
  // Only sync bond_deductions — gift_credits are admin-only via RPC
  const bondDeductions = parseInt(localStorage.getItem('bondify_bond_deductions') || '0', 10) || 0;
  try {
    const { error } = await supabase.from('user_wallets').upsert({
      user_id:         userId,
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

// ── USER BONDS ────────────────────────────────────────────────────────────────

export async function syncUserBonds(userId) {
  try {
    const { data, error } = await supabase
      .from('user_bonds')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) { console.error('[Supabase] syncUserBonds:', error.message); return; }
    const mapped = (data || []).map((b) => ({
      id:                 b.id,
      userId:             b.user_id,
      product_id:         b.product_id,
      product_name:       b.product_name,
      color:              b.color,
      price:              b.price,
      daily_income:       b.daily_income,
      total_income:       b.total_income,
      term_days:          b.term_days,
      started_at:         b.started_at,
      last_credited_date: b.last_credited_date,
      total_credited:     b.total_credited,
      days_completed:     b.days_completed,
      is_active:          b.is_active,
      created_at:         b.created_at,
    }));
    localStorage.setItem(`bondify_bonds_${userId}`, JSON.stringify(mapped));
    // Rebuild bond income from authoritative total_credited values
    const totalBondIncome = mapped.reduce((s, b) => s + (b.total_credited || 0), 0);
    localStorage.setItem('bondify_gift_credits', String(totalBondIncome));
    return mapped;
  } catch (e) {
    console.error('[Supabase] syncUserBonds exception:', e);
  }
}

export async function uploadUserBond(bond) {
  const { error } = await supabase.from('user_bonds').upsert({
    id:                 bond.id,
    user_id:            bond.userId,
    product_id:         bond.product_id,
    product_name:       bond.product_name,
    color:              bond.color || '',
    price:              bond.price,
    daily_income:       bond.daily_income,
    total_income:       bond.total_income,
    term_days:          bond.term_days,
    started_at:         bond.started_at,
    last_credited_date: bond.last_credited_date,
    total_credited:     bond.total_credited,
    days_completed:     bond.days_completed,
    is_active:          bond.is_active,
  }, { onConflict: 'id' });
  if (error) console.error('[Supabase] uploadUserBond:', error.message);
}

export async function uploadAllUserBonds(userId, bonds) {
  if (!userId || !bonds?.length) return;
  const rows = bonds.map((b) => ({
    id:                 b.id,
    user_id:            b.userId,
    product_id:         b.product_id,
    product_name:       b.product_name,
    color:              b.color || '',
    price:              b.price,
    daily_income:       b.daily_income,
    total_income:       b.total_income,
    term_days:          b.term_days,
    started_at:         b.started_at,
    last_credited_date: b.last_credited_date,
    total_credited:     b.total_credited,
    days_completed:     b.days_completed,
    is_active:          b.is_active,
  }));
  const { error } = await supabase.from('user_bonds').upsert(rows, { onConflict: 'id' });
  if (error) console.error('[Supabase] uploadAllUserBonds:', error.message);
}

// ── TASK STATE + FLOW ─────────────────────────────────────────────────────────

export async function syncUserTaskState(userId) {
  try {
    const { data } = await supabase
      .from('user_wallets')
      .select('task_flow, sales_activated_at, task_completed_today, task_total_completed, task_session_day, task_last_day_date, task_countdown_end, vip_level_override, last_checkin_at, last_gift_claimed_date, profile_name, profile_phone')
      .eq('user_id', userId)
      .maybeSingle();
    if (!data) return;
    if (data.task_flow)          localStorage.setItem('bondify_task_flow', data.task_flow);
    if (data.sales_activated_at) localStorage.setItem('bondify_sales_activated_at', data.sales_activated_at);
    if (data.vip_level_override != null) localStorage.setItem('bondify_vip_override', String(data.vip_level_override));

    // Restore check-in — use Supabase value if more recent than local
    if (data.last_checkin_at) {
      const existing = JSON.parse(localStorage.getItem('bondify_checkin') || '{"lastCheckin":null,"history":[]}');
      const supabaseMs = new Date(data.last_checkin_at).getTime();
      const localMs    = existing.lastCheckin ? new Date(existing.lastCheckin).getTime() : 0;
      if (supabaseMs > localMs) {
        existing.lastCheckin = data.last_checkin_at;
        localStorage.setItem('bondify_checkin', JSON.stringify(existing));
      }
    }

    // Restore daily gift claim — prevent re-claiming on a new device
    if (data.last_gift_claimed_date) {
      const existing = JSON.parse(localStorage.getItem('bondify_gift_v2') || '{"lastClaimed":null,"history":[]}');
      if (existing.lastClaimed !== data.last_gift_claimed_date) {
        existing.lastClaimed = data.last_gift_claimed_date;
        localStorage.setItem('bondify_gift_v2', JSON.stringify(existing));
      }
    }

    // Restore profile if Supabase has data and local is empty
    if (data.profile_name || data.profile_phone) {
      const existing = JSON.parse(localStorage.getItem('bondify_profile') || '{}');
      if (data.profile_name  && !existing.fullName) existing.fullName = data.profile_name;
      if (data.profile_phone && !existing.phone)    existing.phone    = data.profile_phone;
      localStorage.setItem('bondify_profile', JSON.stringify(existing));
    }

    const taskState = {
      completedToday: data.task_completed_today || 0,
      totalCompleted: data.task_total_completed || 0,
      sessionDay:     data.task_session_day     || 1,
      lastDayDate:    data.task_last_day_date   || new Date().toDateString(),
      countdownEnd:   data.task_countdown_end   || null,
    };
    localStorage.setItem('bondify_task_state', JSON.stringify(taskState));
    return taskState;
  } catch (e) {
    console.error('[Supabase] syncUserTaskState:', e);
  }
}

export async function uploadCheckIn(userId, isoTimestamp) {
  if (!userId) return;
  const { error } = await supabase.from('user_wallets').upsert({
    user_id:         userId,
    last_checkin_at: isoTimestamp,
    updated_at:      new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) console.error('[Supabase] uploadCheckIn:', error.message);
}

export async function uploadDailyGiftClaim(userId, dateString) {
  if (!userId) return;
  const { error } = await supabase.from('user_wallets').upsert({
    user_id:                userId,
    last_gift_claimed_date: dateString,
    updated_at:             new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) console.error('[Supabase] uploadDailyGiftClaim:', error.message);
}

export async function uploadUserProfile(userId, { fullName, phone }) {
  if (!userId) return;
  const { error } = await supabase.from('user_wallets').upsert({
    user_id:       userId,
    profile_name:  fullName || '',
    profile_phone: phone    || '',
    updated_at:    new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) console.error('[Supabase] uploadUserProfile:', error.message);
}

export async function uploadUserTaskState(userId, taskState) {
  if (!userId) return;
  const { error } = await supabase.from('user_wallets').upsert({
    user_id:               userId,
    task_completed_today:  taskState.completedToday || 0,
    task_total_completed:  taskState.totalCompleted || 0,
    task_session_day:      taskState.sessionDay     || 1,
    task_last_day_date:    taskState.lastDayDate    || '',
    task_countdown_end:    taskState.countdownEnd   || null,
    updated_at:            new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) console.error('[Supabase] uploadUserTaskState:', error.message);
}

export async function uploadUserFlow(userId, flow, salesActivatedAt = null) {
  if (!userId) return;
  const row = { user_id: userId, task_flow: flow, updated_at: new Date().toISOString() };
  if (salesActivatedAt) row.sales_activated_at = salesActivatedAt;
  const { error } = await supabase.from('user_wallets').upsert(row, { onConflict: 'user_id' });
  if (error) console.error('[Supabase] uploadUserFlow:', error.message);
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────

export async function syncNotifications(userId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) { console.error('[Supabase] syncNotifications:', error.message); return; }
    const mapped = (data || []).map((n) => ({
      id: n.id, userId: n.user_id, message: n.message, type: n.type, read: n.read, created_at: n.created_at,
    }));
    localStorage.setItem('bondify_notifications', JSON.stringify(mapped));
    return mapped;
  } catch (e) {
    console.error('[Supabase] syncNotifications:', e);
  }
}

export async function addNotificationToSupabase(userId, { message, type = 'info' }) {
  const id = `N-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const { error } = await supabase.from('notifications').insert({ id, user_id: userId, message, type, read: false });
  if (error) console.error('[Supabase] addNotification:', error.message);
  return id;
}

export async function markNotificationsReadInSupabase(userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) console.error('[Supabase] markNotificationsRead:', error.message);
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
    syncUserBonds(userId),
    syncUserTaskState(userId),
    syncNotifications(userId),
  ]);
}
