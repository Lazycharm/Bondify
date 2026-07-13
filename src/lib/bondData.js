// Demo bond data — replace each DEMO_BONDS[level] fetch with Supabase query when connected
// Schema mirrors: demo_bonds + bond_buyers tables

export const DEMO_BONDS = {
  1: [
    { id: 'v1b1', name: '91-Day Australian T-Bill', type: 'Treasury Bill', face_value: 500000, trust_fee: 2000, profit_high: 7000, profit_mid: 5000, profit_low: 2500 },
    { id: 'v1b2', name: '182-Day T-Bill', type: 'Treasury Bill', face_value: 750000, trust_fee: 2500, profit_high: 8000, profit_mid: 5500, profit_low: 2800 },
    { id: 'v1b3', name: 'Australian Savings Bond A1', type: 'Savings Bond', face_value: 400000, trust_fee: 1800, profit_high: 5800, profit_mid: 4000, profit_low: 2000 },
    { id: 'v1b4', name: 'SME Support Bond', type: 'Savings Bond', face_value: 480000, trust_fee: 2200, profit_high: 6600, profit_mid: 4600, profit_low: 2200 },
    { id: 'v1b5', name: 'Green Energy Bond', type: 'Infrastructure Bond', face_value: 600000, trust_fee: 3000, profit_high: 9000, profit_mid: 6400, profit_low: 3000 },
    { id: 'v1b6', name: 'Agri-Finance Bond', type: 'Savings Bond', face_value: 450000, trust_fee: 2100, profit_high: 6200, profit_mid: 4400, profit_low: 2100 },
    { id: 'v1b7', name: 'Urban Housing Bond', type: 'Treasury Bond', face_value: 550000, trust_fee: 2600, profit_high: 7800, profit_mid: 5500, profit_low: 2600 },
    { id: 'v1b8', name: 'Health Development Bond', type: 'Savings Bond', face_value: 420000, trust_fee: 1900, profit_high: 5600, profit_mid: 4000, profit_low: 1900 },
    { id: 'v1b9', name: 'Digital Economy Bond', type: 'Treasury Bond', face_value: 520000, trust_fee: 2400, profit_high: 7200, profit_mid: 5100, profit_low: 2400 },
    { id: 'v1b10', name: 'Youth Enterprise Bond', type: 'Savings Bond', face_value: 460000, trust_fee: 2100, profit_high: 6400, profit_mid: 4500, profit_low: 2100 },
  ],
  2: [
    { id: 'v2b1', name: '364-Day T-Bill', type: 'Treasury Bill', face_value: 2000000, trust_fee: 8000, profit_high: 25000, profit_mid: 17000, profit_low: 8500 },
    { id: 'v2b2', name: '2-Year Treasury Bond', type: 'Treasury Bond', face_value: 2500000, trust_fee: 10000, profit_high: 30000, profit_mid: 21000, profit_low: 10000 },
    { id: 'v2b3', name: 'Infrastructure Dev Bond A', type: 'Infrastructure Bond', face_value: 3000000, trust_fee: 12000, profit_high: 36000, profit_mid: 25000, profit_low: 12000 },
    { id: 'v2b4', name: 'Telecom Expansion Bond', type: 'Infrastructure Bond', face_value: 2200000, trust_fee: 9000, profit_high: 27000, profit_mid: 19000, profit_low: 9000 },
    { id: 'v2b5', name: 'Water & Sanitation Bond', type: 'Savings Bond', face_value: 1800000, trust_fee: 7500, profit_high: 22000, profit_mid: 15500, profit_low: 7500 },
    { id: 'v2b6', name: 'Energy Grid Bond', type: 'Infrastructure Bond', face_value: 2800000, trust_fee: 11000, profit_high: 33000, profit_mid: 23000, profit_low: 11000 },
    { id: 'v2b7', name: 'Road Network Bond', type: 'Infrastructure Bond', face_value: 2600000, trust_fee: 10500, profit_high: 31000, profit_mid: 21500, profit_low: 10500 },
    { id: 'v2b8', name: 'Financial Inclusion Bond', type: 'Savings Bond', face_value: 2000000, trust_fee: 8000, profit_high: 24000, profit_mid: 17000, profit_low: 8000 },
    { id: 'v2b9', name: 'Export Promotion Bond', type: 'Treasury Bond', face_value: 2400000, trust_fee: 9500, profit_high: 28000, profit_mid: 19500, profit_low: 9500 },
    { id: 'v2b10', name: 'Healthcare Infra Bond', type: 'Infrastructure Bond', face_value: 2100000, trust_fee: 8500, profit_high: 25500, profit_mid: 18000, profit_low: 8500 },
  ],
  3: [
    { id: 'v3b1', name: '3-Year Treasury Bond', type: 'Treasury Bond', face_value: 8000000, trust_fee: 22000, profit_high: 68000, profit_mid: 48000, profit_low: 22000 },
    { id: 'v3b2', name: 'Airport Development Bond', type: 'Infrastructure Bond', face_value: 10000000, trust_fee: 28000, profit_high: 85000, profit_mid: 60000, profit_low: 28000 },
    { id: 'v3b3', name: 'Power Generation Bond', type: 'Infrastructure Bond', face_value: 9500000, trust_fee: 26000, profit_high: 78000, profit_mid: 55000, profit_low: 26000 },
    { id: 'v3b4', name: 'National Railway Bond', type: 'Infrastructure Bond', face_value: 11000000, trust_fee: 30000, profit_high: 90000, profit_mid: 63000, profit_low: 30000 },
    { id: 'v3b5', name: 'IT Park Development Bond', type: 'Infrastructure Bond', face_value: 8500000, trust_fee: 23000, profit_high: 70000, profit_mid: 49000, profit_low: 23000 },
    { id: 'v3b6', name: 'Petroleum Sector Bond', type: 'Treasury Bond', face_value: 9000000, trust_fee: 25000, profit_high: 75000, profit_mid: 53000, profit_low: 25000 },
    { id: 'v3b7', name: 'Marine Transport Bond', type: 'Infrastructure Bond', face_value: 10500000, trust_fee: 29000, profit_high: 87000, profit_mid: 61000, profit_low: 29000 },
    { id: 'v3b8', name: 'University Dev Bond', type: 'Savings Bond', face_value: 7500000, trust_fee: 20000, profit_high: 60000, profit_mid: 42000, profit_low: 20000 },
    { id: 'v3b9', name: 'Industrial Parks Bond', type: 'Infrastructure Bond', face_value: 9200000, trust_fee: 25500, profit_high: 76000, profit_mid: 53500, profit_low: 25500 },
    { id: 'v3b10', name: 'Special Economic Zone Bond', type: 'Treasury Bond', face_value: 10200000, trust_fee: 28500, profit_high: 86000, profit_mid: 60500, profit_low: 28500 },
  ],
  4: [
    { id: 'v4b1', name: '5-Year Treasury Bond', type: 'Treasury Bond', face_value: 20000000, trust_fee: 55000, profit_high: 165000, profit_mid: 115000, profit_low: 55000 },
    { id: 'v4b2', name: 'Oil Pipeline Bond', type: 'Infrastructure Bond', face_value: 28000000, trust_fee: 75000, profit_high: 225000, profit_mid: 158000, profit_low: 75000 },
    { id: 'v4b3', name: 'Hydroelectric Power Bond', type: 'Infrastructure Bond', face_value: 25000000, trust_fee: 68000, profit_high: 204000, profit_mid: 143000, profit_low: 68000 },
    { id: 'v4b4', name: 'National Grid Bond', type: 'Infrastructure Bond', face_value: 22000000, trust_fee: 60000, profit_high: 180000, profit_mid: 126000, profit_low: 60000 },
    { id: 'v4b5', name: 'Smart City Bond', type: 'Infrastructure Bond', face_value: 30000000, trust_fee: 82000, profit_high: 246000, profit_mid: 172000, profit_low: 82000 },
    { id: 'v4b6', name: 'Defense Sector Bond', type: 'Treasury Bond', face_value: 24000000, trust_fee: 65000, profit_high: 195000, profit_mid: 137000, profit_low: 65000 },
    { id: 'v4b7', name: 'Port Development Bond', type: 'Infrastructure Bond', face_value: 26000000, trust_fee: 70000, profit_high: 210000, profit_mid: 147000, profit_low: 70000 },
    { id: 'v4b8', name: 'Space Technology Bond', type: 'Infrastructure Bond', face_value: 32000000, trust_fee: 88000, profit_high: 264000, profit_mid: 185000, profit_low: 88000 },
    { id: 'v4b9', name: 'Mining Development Bond', type: 'Treasury Bond', face_value: 23000000, trust_fee: 63000, profit_high: 189000, profit_mid: 132000, profit_low: 63000 },
    { id: 'v4b10', name: 'Regional Integration Bond', type: 'Treasury Bond', face_value: 27000000, trust_fee: 73000, profit_high: 219000, profit_mid: 153000, profit_low: 73000 },
  ],
  5: [
    { id: 'v5b1', name: '7-Year Treasury Bond', type: 'Treasury Bond', face_value: 50000000, trust_fee: 130000, profit_high: 400000, profit_mid: 280000, profit_low: 130000 },
    { id: 'v5b2', name: 'Nuclear Energy Bond', type: 'Infrastructure Bond', face_value: 70000000, trust_fee: 180000, profit_high: 550000, profit_mid: 385000, profit_low: 180000 },
    { id: 'v5b3', name: 'Satellite Comms Bond', type: 'Infrastructure Bond', face_value: 65000000, trust_fee: 165000, profit_high: 500000, profit_mid: 350000, profit_low: 165000 },
    { id: 'v5b4', name: 'Continental Highway Bond', type: 'Infrastructure Bond', face_value: 75000000, trust_fee: 195000, profit_high: 590000, profit_mid: 413000, profit_low: 195000 },
    { id: 'v5b5', name: 'Deep Sea Port Bond', type: 'Infrastructure Bond', face_value: 80000000, trust_fee: 208000, profit_high: 624000, profit_mid: 437000, profit_low: 208000 },
    { id: 'v5b6', name: 'Central Bank Reserve Bond', type: 'Treasury Bond', face_value: 60000000, trust_fee: 155000, profit_high: 465000, profit_mid: 325500, profit_low: 155000 },
    { id: 'v5b7', name: 'Sovereign Dev Bond', type: 'Treasury Bond', face_value: 58000000, trust_fee: 148000, profit_high: 444000, profit_mid: 310800, profit_low: 148000 },
    { id: 'v5b8', name: 'Continental Railway Bond', type: 'Infrastructure Bond', face_value: 72000000, trust_fee: 185000, profit_high: 555000, profit_mid: 388500, profit_low: 185000 },
    { id: 'v5b9', name: 'National Oil Reserve Bond', type: 'Treasury Bond', face_value: 68000000, trust_fee: 174000, profit_high: 522000, profit_mid: 365400, profit_low: 174000 },
    { id: 'v5b10', name: 'Pan-Africa Investment Bond', type: 'Treasury Bond', face_value: 78000000, trust_fee: 200000, profit_high: 600000, profit_mid: 420000, profit_low: 200000 },
  ],
  6: [
    { id: 'v6b1', name: '10-Year Treasury Bond', type: 'Treasury Bond', face_value: 120000000, trust_fee: 320000, profit_high: 960000, profit_mid: 672000, profit_low: 320000 },
    { id: 'v6b2', name: 'Regional Bloc Bond', type: 'Treasury Bond', face_value: 160000000, trust_fee: 430000, profit_high: 1290000, profit_mid: 903000, profit_low: 430000 },
    { id: 'v6b3', name: 'Continental Energy Grid Bond', type: 'Infrastructure Bond', face_value: 180000000, trust_fee: 480000, profit_high: 1440000, profit_mid: 1008000, profit_low: 480000 },
    { id: 'v6b4', name: 'Trans-Africa Rail Bond', type: 'Infrastructure Bond', face_value: 200000000, trust_fee: 540000, profit_high: 1620000, profit_mid: 1134000, profit_low: 540000 },
    { id: 'v6b5', name: 'Deep Water Oil Bond', type: 'Infrastructure Bond', face_value: 220000000, trust_fee: 590000, profit_high: 1770000, profit_mid: 1239000, profit_low: 590000 },
    { id: 'v6b6', name: 'Space Launch Facility Bond', type: 'Infrastructure Bond', face_value: 190000000, trust_fee: 510000, profit_high: 1530000, profit_mid: 1071000, profit_low: 510000 },
    { id: 'v6b7', name: 'Pan-African Trade Finance Bond', type: 'Treasury Bond', face_value: 140000000, trust_fee: 375000, profit_high: 1125000, profit_mid: 787500, profit_low: 375000 },
    { id: 'v6b8', name: 'Strategic Reserve Bond', type: 'Treasury Bond', face_value: 130000000, trust_fee: 348000, profit_high: 1044000, profit_mid: 730800, profit_low: 348000 },
    { id: 'v6b9', name: 'Continental Airport Bond', type: 'Infrastructure Bond', face_value: 170000000, trust_fee: 455000, profit_high: 1365000, profit_mid: 955500, profit_low: 455000 },
    { id: 'v6b10', name: 'African Central Bank Bond', type: 'Treasury Bond', face_value: 150000000, trust_fee: 400000, profit_high: 1200000, profit_mid: 840000, profit_low: 400000 },
  ],
  7: [
    { id: 'v7b1', name: '15-Year Sovereign Bond', type: 'Treasury Bond', face_value: 300000000, trust_fee: 780000, profit_high: 2340000, profit_mid: 1638000, profit_low: 780000 },
    { id: 'v7b2', name: 'Transoceanic Cable Bond', type: 'Infrastructure Bond', face_value: 420000000, trust_fee: 1080000, profit_high: 3240000, profit_mid: 2268000, profit_low: 1080000 },
    { id: 'v7b3', name: 'Pan-African Smart Grid Bond', type: 'Infrastructure Bond', face_value: 380000000, trust_fee: 980000, profit_high: 2940000, profit_mid: 2058000, profit_low: 980000 },
    { id: 'v7b4', name: 'Continental Water Authority Bond', type: 'Infrastructure Bond', face_value: 450000000, trust_fee: 1160000, profit_high: 3480000, profit_mid: 2436000, profit_low: 1160000 },
    { id: 'v7b5', name: 'Regional Defense Alliance Bond', type: 'Treasury Bond', face_value: 350000000, trust_fee: 900000, profit_high: 2700000, profit_mid: 1890000, profit_low: 900000 },
    { id: 'v7b6', name: 'Pan-African HSR Bond', type: 'Infrastructure Bond', face_value: 500000000, trust_fee: 1300000, profit_high: 3900000, profit_mid: 2730000, profit_low: 1300000 },
    { id: 'v7b7', name: 'Strategic Mineral Reserve Bond', type: 'Treasury Bond', face_value: 330000000, trust_fee: 850000, profit_high: 2550000, profit_mid: 1785000, profit_low: 850000 },
    { id: 'v7b8', name: 'Continental Media Network Bond', type: 'Infrastructure Bond', face_value: 360000000, trust_fee: 928000, profit_high: 2784000, profit_mid: 1948800, profit_low: 928000 },
    { id: 'v7b9', name: 'African Space Agency Bond', type: 'Treasury Bond', face_value: 410000000, trust_fee: 1055000, profit_high: 3165000, profit_mid: 2215500, profit_low: 1055000 },
    { id: 'v7b10', name: 'Global Connectivity Bond', type: 'Infrastructure Bond', face_value: 480000000, trust_fee: 1235000, profit_high: 3705000, profit_mid: 2593500, profit_low: 1235000 },
  ],
  8: [
    { id: 'v8b1', name: '20-Year Sovereign Bond', type: 'Treasury Bond', face_value: 700000000, trust_fee: 1850000, profit_high: 5550000, profit_mid: 3885000, profit_low: 1850000 },
    { id: 'v8b2', name: 'International Shipping Alliance Bond', type: 'Infrastructure Bond', face_value: 950000000, trust_fee: 2500000, profit_high: 7500000, profit_mid: 5250000, profit_low: 2500000 },
    { id: 'v8b3', name: 'Global Clean Energy Bond', type: 'Infrastructure Bond', face_value: 1100000000, trust_fee: 2900000, profit_high: 8700000, profit_mid: 6090000, profit_low: 2900000 },
    { id: 'v8b4', name: 'World Heritage Dev Bond', type: 'Savings Bond', face_value: 800000000, trust_fee: 2100000, profit_high: 6300000, profit_mid: 4410000, profit_low: 2100000 },
    { id: 'v8b5', name: 'Continental Tech Corridor Bond', type: 'Infrastructure Bond', face_value: 1200000000, trust_fee: 3200000, profit_high: 9600000, profit_mid: 6720000, profit_low: 3200000 },
    { id: 'v8b6', name: 'Intercontinental Trade Hub Bond', type: 'Treasury Bond', face_value: 1050000000, trust_fee: 2750000, profit_high: 8250000, profit_mid: 5775000, profit_low: 2750000 },
    { id: 'v8b7', name: 'Global Health Security Bond', type: 'Savings Bond', face_value: 850000000, trust_fee: 2250000, profit_high: 6750000, profit_mid: 4725000, profit_low: 2250000 },
    { id: 'v8b8', name: 'World Water Initiative Bond', type: 'Infrastructure Bond', face_value: 900000000, trust_fee: 2380000, profit_high: 7140000, profit_mid: 4998000, profit_low: 2380000 },
    { id: 'v8b9', name: 'International Aviation Hub Bond', type: 'Infrastructure Bond', face_value: 1150000000, trust_fee: 3050000, profit_high: 9150000, profit_mid: 6405000, profit_low: 3050000 },
    { id: 'v8b10', name: 'Global Digital Highway Bond', type: 'Infrastructure Bond', face_value: 1000000000, trust_fee: 2640000, profit_high: 7920000, profit_mid: 5544000, profit_low: 2640000 },
  ],
  9: [
    { id: 'v9b1', name: '25-Year Sovereign Bond', type: 'Treasury Bond', face_value: 1800000000, trust_fee: 4700000, profit_high: 14100000, profit_mid: 9870000, profit_low: 4700000 },
    { id: 'v9b2', name: 'Transcontinental Energy Bond', type: 'Infrastructure Bond', face_value: 2500000000, trust_fee: 6500000, profit_high: 19500000, profit_mid: 13650000, profit_low: 6500000 },
    { id: 'v9b3', name: 'Global Infrastructure Alliance Bond', type: 'Infrastructure Bond', face_value: 2200000000, trust_fee: 5700000, profit_high: 17100000, profit_mid: 11970000, profit_low: 5700000 },
    { id: 'v9b4', name: 'World Economic Dev Bond', type: 'Treasury Bond', face_value: 2000000000, trust_fee: 5200000, profit_high: 15600000, profit_mid: 10920000, profit_low: 5200000 },
    { id: 'v9b5', name: 'International Space Commerce Bond', type: 'Infrastructure Bond', face_value: 3000000000, trust_fee: 7800000, profit_high: 23400000, profit_mid: 16380000, profit_low: 7800000 },
    { id: 'v9b6', name: 'Global Ocean Development Bond', type: 'Infrastructure Bond', face_value: 2800000000, trust_fee: 7300000, profit_high: 21900000, profit_mid: 15330000, profit_low: 7300000 },
    { id: 'v9b7', name: 'Interplanetary Comm Bond', type: 'Infrastructure Bond', face_value: 3200000000, trust_fee: 8400000, profit_high: 25200000, profit_mid: 17640000, profit_low: 8400000 },
    { id: 'v9b8', name: 'World Fusion Energy Bond', type: 'Infrastructure Bond', face_value: 2700000000, trust_fee: 7000000, profit_high: 21000000, profit_mid: 14700000, profit_low: 7000000 },
    { id: 'v9b9', name: 'Global Carbon Credit Bond', type: 'Savings Bond', face_value: 2100000000, trust_fee: 5500000, profit_high: 16500000, profit_mid: 11550000, profit_low: 5500000 },
    { id: 'v9b10', name: 'Quantum Computing Infra Bond', type: 'Infrastructure Bond', face_value: 2900000000, trust_fee: 7550000, profit_high: 22650000, profit_mid: 15855000, profit_low: 7550000 },
  ],
  10: [
    { id: 'v10b1', name: 'Perpetual Sovereign Bond', type: 'Treasury Bond', face_value: 5000000000, trust_fee: 13000000, profit_high: 39000000, profit_mid: 27300000, profit_low: 13000000 },
    { id: 'v10b2', name: 'Quantum Satellite Network Bond', type: 'Infrastructure Bond', face_value: 7000000000, trust_fee: 18200000, profit_high: 54600000, profit_mid: 38220000, profit_low: 18200000 },
    { id: 'v10b3', name: 'Global AI Infrastructure Bond', type: 'Infrastructure Bond', face_value: 8000000000, trust_fee: 20800000, profit_high: 62400000, profit_mid: 43680000, profit_low: 20800000 },
    { id: 'v10b4', name: 'Interplanetary Trade Bond', type: 'Treasury Bond', face_value: 6000000000, trust_fee: 15600000, profit_high: 46800000, profit_mid: 32760000, profit_low: 15600000 },
    { id: 'v10b5', name: 'World Fusion Power Bond', type: 'Infrastructure Bond', face_value: 9000000000, trust_fee: 23400000, profit_high: 70200000, profit_mid: 49140000, profit_low: 23400000 },
    { id: 'v10b6', name: 'Continental Megacity Bond', type: 'Infrastructure Bond', face_value: 7500000000, trust_fee: 19500000, profit_high: 58500000, profit_mid: 40950000, profit_low: 19500000 },
    { id: 'v10b7', name: 'Global Ocean Mining Bond', type: 'Infrastructure Bond', face_value: 8500000000, trust_fee: 22100000, profit_high: 66300000, profit_mid: 46410000, profit_low: 22100000 },
    { id: 'v10b8', name: 'Space Colony Infra Bond', type: 'Infrastructure Bond', face_value: 10000000000, trust_fee: 26000000, profit_high: 78000000, profit_mid: 54600000, profit_low: 26000000 },
    { id: 'v10b9', name: 'Anti-Gravity Transport Bond', type: 'Infrastructure Bond', face_value: 9500000000, trust_fee: 24700000, profit_high: 74100000, profit_mid: 51870000, profit_low: 24700000 },
    { id: 'v10b10', name: 'Universal Clean Energy Bond', type: 'Infrastructure Bond', face_value: 8200000000, trust_fee: 21320000, profit_high: 63960000, profit_mid: 44772000, profit_low: 21320000 },
  ],
};

// Pool of 30 buyers — 3 are picked per task session, different per user via seeded PRNG
export const BUYER_POOL = [
  { name: 'John Mugabi', company: 'Kampala Trading Co' },
  { name: 'Sarah Nakato', company: 'Nile Business Holdings' },
  { name: 'Grace Akello', company: 'Victoria Investment Group' },
  { name: 'Robert Ssebugwawo', company: 'Pearl Finance Corp' },
  { name: 'Fatuma Hassan', company: 'Crescent Trading Ltd' },
  { name: 'David Ochieng', company: 'East Lake Capital' },
  { name: 'James Otieno', company: 'Atlas Capital Corp' },
  { name: 'Catherine Namuli', company: 'Horizon Securities Ltd' },
  { name: 'Michael Okello', company: 'Pinnacle Finance Group' },
  { name: 'Elizabeth Nanteza', company: 'Meridian Investment Corp' },
  { name: 'George Asiimwe', company: 'Continental Business Holdings' },
  { name: 'Patricia Adong', company: 'Summit Capital Ltd' },
  { name: 'Richard Tumwebaze', company: 'Pan-Africa Capital Group' },
  { name: 'Agnes Mutesi', company: 'Great Lakes Investment Bank' },
  { name: 'Emmanuel Kato', company: 'East Africa Securities Corp' },
  { name: 'Josephine Akwi', company: 'African Development Capital' },
  { name: 'Henry Muzaale', company: 'Rift Valley Finance Corp' },
  { name: 'Miriam Nagawa', company: 'Continental Trading Holdings' },
  { name: 'Simon Ouma', company: 'African Investment Authority' },
  { name: 'Stella Ahimbisibwe', company: 'National Sovereign Fund' },
  { name: 'Omar Abdullah', company: 'Sahara Capital Partners' },
  { name: 'Kwame Asante', company: 'African Development Alliance' },
  { name: 'Fatou Diallo', company: 'West Africa Capital Corp' },
  { name: 'Ibrahim Al-Rashid', company: 'North Africa Finance Group' },
  { name: 'Alexander Rothschild', company: 'Global Asset Management' },
  { name: 'Victoria Chen', company: 'Pacific Investment Group' },
  { name: 'Mohammed Al-Maktoum', company: 'Gulf Capital Alliance' },
  { name: 'Sophia Anderson', company: 'World Asset Corporation' },
  { name: 'Carlos Mendez', company: 'International Trade Finance' },
  { name: 'Pierre Dubois', company: 'European Investment Authority' },
];

// Fast seeded PRNG — same seed = same buyers, so page refreshes are stable
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  return Math.abs(h);
}

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Generates 3 unique buyers with correct pricing for a given user + bond + date.
 *
 * Buyer price model:
 *   buyer_price = face_value + trust_fee + net_profit
 *   → Admin takes face_value back
 *   → User receives: trust_fee (returned) + net_profit
 *   → Net wallet gain for user = net_profit
 *
 * Prices vary ±12% from base tiers so each user sees different numbers.
 * Seed = userId + bondId + today's date → stable per session, different per user.
 */
export function generateBuyerSession(userId, bondId, bond) {
  const date = new Date().toDateString();
  const seed = hashCode(`${userId || 'demo'}-${bondId}-${date}`);
  const rand = mulberry32(seed);

  // Pick 3 unique buyers from pool
  const pool = [...BUYER_POOL];
  const picked = [];
  while (picked.length < 3) {
    const idx = Math.floor(rand() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }

  // Vary profit tiers ±12% to give each user unique prices
  const vary = (base) => Math.round(base * (0.88 + rand() * 0.24));

  const p1 = vary(bond.profit_low);
  const p2 = vary(bond.profit_mid);
  const p3 = vary(bond.profit_high);

  // Ensure strict ascending order regardless of variation
  const [low, mid, high] = [p1, p2, p3].sort((a, b) => a - b);

  const base = bond.face_value + bond.trust_fee;

  return [
    { ...picked[0], rank: 1, net_profit: low,  buyer_price: base + low  },
    { ...picked[1], rank: 2, net_profit: mid,  buyer_price: base + mid  },
    { ...picked[2], rank: 3, net_profit: high, buyer_price: base + high },
  ];
}

// Upgrade teaser bond shown at day 4+ — entices user to go to next VIP level
export const UPGRADE_BONDS = {
  1: { next_vip: 2, next_name: 'Bronze', color: 'from-amber-600 to-amber-700', bond_name: '2-Year Bronze Bond', face_value: 2500000, trust_fee: 10000, profit_high: 30000 },
  2: { next_vip: 3, next_name: 'Silver', color: 'from-slate-300 to-slate-400', bond_name: '3-Year Silver Bond', face_value: 8000000, trust_fee: 22000, profit_high: 68000 },
  3: { next_vip: 4, next_name: 'Gold', color: 'from-yellow-400 to-amber-500', bond_name: '5-Year Gold Bond', face_value: 20000000, trust_fee: 55000, profit_high: 165000 },
  4: { next_vip: 5, next_name: 'Platinum', color: 'from-cyan-300 to-teal-400', bond_name: '7-Year Platinum Bond', face_value: 50000000, trust_fee: 130000, profit_high: 400000 },
  5: { next_vip: 6, next_name: 'Diamond', color: 'from-blue-300 to-indigo-400', bond_name: '10-Year Diamond Bond', face_value: 120000000, trust_fee: 320000, profit_high: 960000 },
  6: { next_vip: 7, next_name: 'Emerald', color: 'from-emerald-400 to-green-500', bond_name: '15-Year Emerald Bond', face_value: 300000000, trust_fee: 780000, profit_high: 2340000 },
  7: { next_vip: 8, next_name: 'Sapphire', color: 'from-sky-400 to-blue-500', bond_name: '20-Year Sapphire Bond', face_value: 700000000, trust_fee: 1850000, profit_high: 5550000 },
  8: { next_vip: 9, next_name: 'Ruby', color: 'from-rose-400 to-red-500', bond_name: '25-Year Ruby Bond', face_value: 1800000000, trust_fee: 4700000, profit_high: 14100000 },
  9: { next_vip: 10, next_name: 'Crown', color: 'from-amber-300 via-yellow-400 to-amber-500', bond_name: 'Perpetual Crown Bond', face_value: 5000000000, trust_fee: 13000000, profit_high: 39000000 },
};
