# Bondify — INSTRUCTIONS

Quick reference for developers continuing this project.

## What is Bondify?

A bond sales and optimization platform for Uganda. Users pay a small trust fee to acquire a government treasury bond, then sell it to the highest of 3 competing buyers to earn profit. Tasks are gamified across 10 VIP levels with a 7-day cycle per level.

## Quick Start

```bash
cd "D:\A office\AyoubOS\03 Projects\Bondify"
npm install
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

## Supabase Setup (one-time)

1. Create a new Supabase project at supabase.com
2. Go to SQL Editor and run these migrations **in order**:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_game_tables.sql` (TODO — see TODO.md)
   - `supabase/migrations/003_demo_data.sql` (TODO — see TODO.md)
3. Enable Email provider in Supabase → Authentication → Providers
4. Set Site URL and Redirect URLs in Supabase → Authentication → URL Configuration
5. Copy URL + anon key to `.env`

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/AuthContext.jsx` | Supabase auth state, `useAuth()` hook |
| `src/lib/bondData.js` | 100 demo bonds (10/VIP × 10 levels), 3 buyers each |
| `src/lib/vipData.js` | VIP_LEVELS with economics, `formatUGX()` |
| `src/pages/TaskCenter.jsx` | Main task flow entry — bond grid, progress |
| `src/pages/BuyerSelection.jsx` | 3-buyer selection with animation |
| `src/pages/SalesContract.jsx` | Digital contract with signature animation |
| `src/pages/ClaimProfits.jsx` | Profit claim, task counter, 24h countdown |
| `src/api/supabaseClient.js` | Supabase singleton |

## Task Flow

```
TaskCenter → BuyerSelection → SalesContract → ClaimProfits → TaskCenter
```

## Notes

- State between task flow pages is stored in `localStorage` (`bondify_active_bond`, `bondify_sale_data`, `bondify_task_state`)
- Once Supabase is connected, replace localStorage calls with Supabase queries
- VIP level is currently hardcoded as `DEMO_VIP_LEVEL = 1` in TaskCenter — wire to real user profile from wallets table
- Wallet balance is currently hardcoded as `DEMO_WALLET_BALANCE = 185000` — wire to wallets table
- See `INSTRUCTIONS/BUSINESS_LOGIC.md` for full mechanics
- See `INSTRUCTIONS/TODO.md` for what's left
