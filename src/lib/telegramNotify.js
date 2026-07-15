import { getPaymentSettings } from './paymentSettings';

// creds: optional { token, chatId } from a Supabase-loaded config (avoids localStorage race)
export async function sendTelegram(message, creds = {}) {
  const token = creds.token || import.meta.env.VITE_TELEGRAM_BOT_TOKEN || getPaymentSettings().telegram_token;
  const chatId = creds.chatId || import.meta.env.VITE_TELEGRAM_CHAT_ID || getPaymentSettings().telegram_chat_id;
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
