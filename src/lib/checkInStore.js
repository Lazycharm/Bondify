import { addGiftCredit } from './depositStore';

const KEY = 'bondify_checkin';
export const CHECKIN_BONUS = 300;

export function getCheckInData() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{"totalBonus":0,"lastCheckin":null,"history":[]}'); }
  catch { return { totalBonus: 0, lastCheckin: null, history: [] }; }
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

export function doCheckIn() {
  if (!canCheckIn()) return 0;
  const data = getCheckInData();
  const now = new Date().toISOString();
  const updated = {
    totalBonus: (data.totalBonus || 0) + CHECKIN_BONUS,
    lastCheckin: now,
    history: [now, ...(data.history || [])].slice(0, 60),
  };
  localStorage.setItem(KEY, JSON.stringify(updated));
  return CHECKIN_BONUS;
}

export function withdrawCheckInBonus() {
  const data = getCheckInData();
  const amount = data.totalBonus || 0;
  if (amount <= 0) return 0;
  addGiftCredit(amount);
  localStorage.setItem(KEY, JSON.stringify({ ...data, totalBonus: 0 }));
  return amount;
}
