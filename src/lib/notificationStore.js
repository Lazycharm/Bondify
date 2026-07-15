import { addNotificationToSupabase, syncNotifications, markNotificationsReadInSupabase } from './supabase_ops';

const KEY = 'bondify_notifications';

export function getNotifications() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function getUserNotifications(userId) {
  return getNotifications().filter((n) => n.userId === userId);
}

export function getUnreadCount(userId) {
  return getUserNotifications(userId).filter((n) => !n.read).length;
}

export function addNotification(userId, { message, type = 'info' }) {
  // Write to Supabase so the actual user receives it on their device
  addNotificationToSupabase(userId, { message, type }).catch(() => {});

  // Also write locally for immediate UI feedback on admin's device
  const all = getNotifications();
  const notif = {
    id: `N-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    message,
    type,
    read: false,
    created_at: new Date().toISOString(),
  };
  all.unshift(notif);
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 50)));
  return notif;
}

export async function refreshNotifications(userId) {
  return syncNotifications(userId);
}

export async function markAllRead(userId) {
  const all = getNotifications().map((n) =>
    n.userId === userId ? { ...n, read: true } : n
  );
  localStorage.setItem(KEY, JSON.stringify(all));
  markNotificationsReadInSupabase(userId).catch(() => {});
}
