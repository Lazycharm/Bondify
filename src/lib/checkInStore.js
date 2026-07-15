import { addGiftCredit } from './depositStore';
import { uploadCheckIn } from './supabase_ops';

const KEY = 'bondify_checkin';
export const CHECKIN_BONUS = 300;

export function getCheckInData() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{"lastCheckin":null,"history":[]}'); }
  catch { return { lastCheckin: null, history: [] }; }
}

export function canCheckIn() {
  const { lastCheckin } = getCheckInData();
  if (!lastCheckin) return true;
  return (Date.now() - new Date(lastCheckin).getTime()) >= 24 * 60 * 60 * 1000;
}

export function msUntilNextCheckIn() {
  const { lastCheckin } = getCheckInData();
  if (!lastCheckin) return 0;
  return Math.max(0, 24 * 60 * 60 * 1000 - (Date.now() - new Date(lastCheckin).getTime()));
}

export function doCheckIn(userId = null) {
  if (!canCheckIn()) return 0;
  const data = getCheckInData();
  const now = new Date().toISOString();
  const updated = {
    lastCheckin: now,
    history: [now, ...(data.history || [])].slice(0, 60),
  };
  localStorage.setItem(KEY, JSON.stringify(updated));
  addGiftCredit(CHECKIN_BONUS);
  if (userId) uploadCheckIn(userId, now).catch(() => {});
  return CHECKIN_BONUS;
}
