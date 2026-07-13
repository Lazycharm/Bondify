const KEY = 'bondify_payment_settings';

const DEFAULTS = {
  mtn_number: '',
  mtn_name: '',
  airtel_number: '',
  airtel_name: '',
  telegram_token: '',
  telegram_chat_id: '',
  admin_emails: '',
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

export function isAdmin(userEmail) {
  if (!userEmail) return false;
  const { admin_emails } = getPaymentSettings();
  if (!admin_emails || !admin_emails.trim()) return true; // open until configured
  return admin_emails.split(',').map((e) => e.trim().toLowerCase()).includes(userEmail.toLowerCase());
}
