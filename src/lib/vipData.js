// bonds_to_complete must be divisible by 7 (bonds_per_day = bonds_to_complete / 7)
// min_balance = minimum wallet balance that must be maintained (UGX 5,000)
export const VIP_LEVELS = [
  {
    level: 1, name: 'Starter', color: 'from-slate-400 to-slate-500',
    min_investment: 20000, min_balance: 5000,
    bonds_to_complete: 21, // 3/day × 7 days
    trust_fee_min: 1800, trust_fee_max: 3000,
    profit_min: 5600, profit_max: 9000,
    daily_earnings_min: 2000, daily_earnings_max: 4000,
    perks: ['3 bonds/day', 'Basic support', 'Withdrawal access'],
  },
  {
    level: 2, name: 'Bronze', color: 'from-amber-600 to-amber-700',
    min_investment: 50000, min_balance: 5000,
    bonds_to_complete: 28, // 4/day × 7 days
    trust_fee_min: 7500, trust_fee_max: 12000,
    profit_min: 22000, profit_max: 36000,
    daily_earnings_min: 5000, daily_earnings_max: 9000,
    perks: ['4 bonds/day', 'Priority support', 'Referral boost'],
  },
  {
    level: 3, name: 'Silver', color: 'from-slate-300 to-slate-400',
    min_investment: 100000, min_balance: 5000,
    bonds_to_complete: 35, // 5/day × 7 days
    trust_fee_min: 20000, trust_fee_max: 30000,
    profit_min: 60000, profit_max: 90000,
    daily_earnings_min: 10000, daily_earnings_max: 18000,
    perks: ['5 bonds/day', 'Weekly gift codes', 'Lower fees'],
  },
  {
    level: 4, name: 'Gold', color: 'from-yellow-400 to-amber-500',
    min_investment: 250000, min_balance: 5000,
    bonds_to_complete: 42, // 6/day × 7 days
    trust_fee_min: 55000, trust_fee_max: 88000,
    profit_min: 165000, profit_max: 264000,
    daily_earnings_min: 25000, daily_earnings_max: 45000,
    perks: ['6 bonds/day', 'VIP support', 'Bonus multiplier'],
  },
  {
    level: 5, name: 'Platinum', color: 'from-cyan-300 to-teal-400',
    min_investment: 500000, min_balance: 5000,
    bonds_to_complete: 49, // 7/day × 7 days
    trust_fee_min: 130000, trust_fee_max: 210000,
    profit_min: 400000, profit_max: 630000,
    daily_earnings_min: 50000, daily_earnings_max: 90000,
    perks: ['7 bonds/day', 'Personal manager', 'Exclusive bonds'],
  },
  {
    level: 6, name: 'Diamond', color: 'from-blue-300 to-indigo-400',
    min_investment: 1000000, min_balance: 5000,
    bonds_to_complete: 56, // 8/day × 7 days
    trust_fee_min: 320000, trust_fee_max: 540000,
    profit_min: 960000, profit_max: 1620000,
    daily_earnings_min: 100000, daily_earnings_max: 180000,
    perks: ['8 bonds/day', 'Instant withdrawals', 'Premium gifts'],
  },
  {
    level: 7, name: 'Emerald', color: 'from-emerald-400 to-green-500',
    min_investment: 2000000, min_balance: 5000,
    bonds_to_complete: 63, // 9/day × 7 days
    trust_fee_min: 780000, trust_fee_max: 1300000,
    profit_min: 2340000, profit_max: 3900000,
    daily_earnings_min: 200000, daily_earnings_max: 360000,
    perks: ['9 bonds/day', '2x referral rate', 'VIP events'],
  },
  {
    level: 8, name: 'Sapphire', color: 'from-sky-400 to-blue-500',
    min_investment: 5000000, min_balance: 5000,
    bonds_to_complete: 70, // 10/day × 7 days
    trust_fee_min: 1850000, trust_fee_max: 3200000,
    profit_min: 5550000, profit_max: 9600000,
    daily_earnings_min: 500000, daily_earnings_max: 900000,
    perks: ['10 bonds/day', 'Elite manager', 'Custom bonds'],
  },
  {
    level: 9, name: 'Ruby', color: 'from-rose-400 to-red-500',
    min_investment: 10000000, min_balance: 5000,
    bonds_to_complete: 77, // 11/day × 7 days
    trust_fee_min: 4700000, trust_fee_max: 8400000,
    profit_min: 14100000, profit_max: 25200000,
    daily_earnings_min: 1000000, daily_earnings_max: 1800000,
    perks: ['11 bonds/day', 'Concierge service', 'Max rewards'],
  },
  {
    level: 10, name: 'Crown', color: 'from-amber-300 via-yellow-400 to-amber-500',
    min_investment: 20000000, min_balance: 5000,
    bonds_to_complete: 84, // 12/day × 7 days
    trust_fee_min: 13000000, trust_fee_max: 26000000,
    profit_min: 39000000, profit_max: 78000000,
    daily_earnings_min: 2000000, daily_earnings_max: 5000000,
    perks: ['12 bonds/day', 'Founders club', 'Unlimited access'],
  },
];

export function getBondsPerDay(vipLevel) {
  const v = VIP_LEVELS.find(l => l.level === vipLevel);
  return v ? v.bonds_to_complete / 7 : 3;
}

export function formatUGX(n) {
  return 'UGX ' + Math.round(n).toLocaleString('en-US');
}

export function formatUGXShort(n) {
  if (n >= 1000000) return 'UGX ' + (n / 1000000).toFixed(n >= 10000000 ? 0 : 1) + 'M';
  if (n >= 1000) return 'UGX ' + (n / 1000).toFixed(n >= 100000 ? 0 : 1) + 'K';
  return 'UGX ' + Math.round(n);
}
