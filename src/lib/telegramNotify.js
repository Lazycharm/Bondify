import { getPaymentSettings } from './paymentSettings';

export async function sendTelegram(message) {
  // Env vars are baked at build time — available from any user's browser.
  // Admin localStorage settings work as fallback for the admin's own browser.
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || getPaymentSettings().telegram_token;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID || getPaymentSettings().telegram_chat_id;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
  } catch { /* silent — never block UX for notifications */ }
}
