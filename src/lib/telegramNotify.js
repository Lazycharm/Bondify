import { getPaymentSettings } from './paymentSettings';

export async function sendTelegram(message) {
  const { telegram_token, telegram_chat_id } = getPaymentSettings();
  if (!telegram_token || !telegram_chat_id) return;
  try {
    await fetch(`https://api.telegram.org/bot${telegram_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegram_chat_id,
        text: message,
        parse_mode: 'HTML',
      }),
    });
  } catch { /* silent — never block UX for notifications */ }
}
