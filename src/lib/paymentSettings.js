const KEY = 'bondify_payment_settings';

const DEFAULTS = {
  mtn_number: '',
  mtn_name: '',
  airtel_number: '',
  airtel_name: '',
  telegram_token: '',
  telegram_chat_id: '',
  admin_emails: '',
  support_telegram_link: '',
  referral_lv1: '5',
  referral_lv2: '2',
  referral_lv3: '1',
};

export function getPaymentSettings() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return { ...DEFAULTS };
  }
}

export function savePaymentSettings(settings) {
  localStorage.setItem(KEY, JSON.stringify(settings));
}

const OWNER_EMAIL = 'axismindclick@gmail.com';

export function isAdmin(userEmail) {
  if (!userEmail) return false;
  if (userEmail.toLowerCase() === OWNER_EMAIL) return true;
  const { admin_emails } = getPaymentSettings();
  if (!admin_emails || !admin_emails.trim()) return false;
  return admin_emails.split(',').map((e) => e.trim().toLowerCase()).includes(userEmail.toLowerCase());
}
