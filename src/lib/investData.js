export const INVEST_PRODUCTS = [
  {
    id: 'inv1',
    level: 1,
    name: 'Starter Bond',
    subtitle: '91-Day Treasury Bill · Government Backed',
    price: 25000,
    daily_income: 4000,
    term: 360,
    total_income: 1440000,
    color: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/30',
    badge: 'Entry Level',
  },
  {
    id: 'inv2',
    level: 2,
    name: 'Bronze Bond',
    subtitle: '182-Day Treasury Bill · Government Backed',
    price: 50000,
    daily_income: 15000,
    term: 360,
    total_income: 5400000,
    color: 'from-amber-600 to-orange-600',
    shadow: 'shadow-amber-600/30',
    badge: 'Popular',
  },
  {
    id: 'inv3',
    level: 3,
    name: 'Silver Bond',
    subtitle: '364-Day Treasury Bond · Fixed Income',
    price: 199000,
    daily_income: 37900,
    term: 360,
    total_income: 13644000,
    color: 'from-slate-400 to-slate-500',
    shadow: 'shadow-slate-400/30',
    badge: null,
  },
  {
    id: 'inv4',
    level: 4,
    name: 'Gold Bond',
    subtitle: '2-Year Infrastructure Bond',
    price: 220000,
    daily_income: 66000,
    term: 360,
    total_income: 23760000,
    color: 'from-yellow-400 to-amber-500',
    shadow: 'shadow-yellow-400/30',
    badge: 'Best Value',
  },
  {
    id: 'inv5',
    level: 5,
    name: 'Platinum Bond',
    subtitle: '5-Year Sovereign Bond',
    price: 500000,
    daily_income: 120000,
    term: 360,
    total_income: 43200000,
    color: 'from-cyan-400 to-blue-500',
    shadow: 'shadow-cyan-400/30',
    badge: null,
  },
  {
    id: 'inv6',
    level: 6,
    name: 'Diamond Bond',
    subtitle: '10-Year Continental Bond',
    price: 700000,
    daily_income: 150000,
    term: 360,
    total_income: 54000000,
    color: 'from-violet-500 to-purple-600',
    shadow: 'shadow-violet-500/30',
    badge: null,
  },
  {
    id: 'inv7',
    level: 7,
    name: 'Crown Bond',
    subtitle: '20-Year Sovereign Wealth Bond',
    price: 1000000,
    daily_income: 330000,
    term: 360,
    total_income: 118800000,
    color: 'from-rose-500 to-pink-600',
    shadow: 'shadow-rose-500/30',
    badge: 'Max Returns',
  },
];

export function getBondConfig() {
  try {
    const s = localStorage.getItem('bondify_bond_config');
    if (s) return JSON.parse(s);
  } catch {}
  return INVEST_PRODUCTS;
}

export function saveBondConfig(bonds) {
  localStorage.setItem('bondify_bond_config', JSON.stringify(bonds));
}

export function getBondImages() {
  try {
    const s = localStorage.getItem('bondify_bond_images');
    if (s) return JSON.parse(s);
  } catch {}
  return {};
}

export function saveBondImages(images) {
  localStorage.setItem('bondify_bond_images', JSON.stringify(images));
}
