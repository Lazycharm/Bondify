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
  const all = getNotifications();
  const notif = {
    id: `N-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    message,
    type, // 'success' | 'error' | 'info'
    read: false,
    created_at: new Date().toISOString(),
  };
  all.unshift(notif);
  // Keep only last 50 notifications globally
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 50)));
  return notif;
}

export function markAllRead(userId) {
  const all = getNotifications().map((n) =>
    n.userId === userId ? { ...n, read: true } : n
  );
  localStorage.setItem(KEY, JSON.stringify(all));
}
