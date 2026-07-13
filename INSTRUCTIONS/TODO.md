# Bondify — TODO List

## Priority 1 — Supabase Connection (blocking for production)

- [ ] Create Supabase project (user must do this manually — free tier allows 2 projects)
- [ ] Run `001_initial_schema.sql` in Supabase SQL Editor
- [ ] Create `.env` with real `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] Enable Email auth in Supabase dashboard → Authentication → Providers
- [ ] Set Site URL to Vercel domain in Supabase → Authentication → URL Configuration
- [ ] Create `supabase/migrations/002_game_tables.sql` with tables:
  - `admin_vip_config` — admin-configurable VIP economics
  - `demo_bonds` — mirrors `src/lib/bondData.js` in database
  - `bond_buyers` — buyer names/companies per VIP level
  - `user_task_sessions` — per-day task tracking
  - `user_bond_assignments` — tracks which bond was assigned per task
  - `user_vip_progress` — current VIP level, day, total completed
  - `bond_sales` — completed sale records
- [ ] Create `supabase/migrations/003_demo_data.sql` — seed 100 bonds + 300 buyers
- [ ] Wire TaskCenter to real wallet balance from `wallets` table
- [ ] Wire TaskCenter VIP level from `user_vip_progress` or `wallets` table
- [ ] Replace localStorage task state with `user_task_sessions` Supabase queries

## Priority 2 — Core Feature Completion

- [ ] Dashboard.jsx — replace all hardcoded data with Supabase queries
  - Real wallet balance, total earnings, recent transactions
  - Today's tasks completed / remaining
- [ ] WalletPage.jsx — connect to `wallets` + `transactions` tables
- [ ] VipLevels.jsx — show real user VIP level from profile
- [ ] Profile.jsx — show real user name, email, join date from auth.users
- [ ] Add video hero to Landing.jsx — set `HERO_VIDEO_SRC` constant with real video path

## Priority 3 — Admin Panel

- [ ] Create `/admin` route (protected by admin role check)
- [ ] Admin can configure bonds per day per VIP level
- [ ] Admin can set trust fee and profit ranges
- [ ] Admin can approve/reject withdrawal requests
- [ ] Admin can generate gift codes

## Priority 4 — Payments

- [ ] MTN Mobile Money deposit integration
- [ ] Airtel Money deposit integration
- [ ] Bank transfer deposit integration
- [ ] Withdrawal approval workflow (admin side)

## Priority 5 — Polish

- [ ] Push notifications for profit claims
- [ ] Email notifications for successful withdrawals
- [ ] Referral tracking — wire Referrals.jsx to `referrals` table
- [ ] Achievements — wire Achievements.jsx to `achievements` table
- [ ] Daily Gift — wire DailyGift.jsx to `check_ins` table
- [ ] Calculator — wire to real VIP data (currently may use mock)
- [ ] Marketplace — define what this page shows

## Done ✓

- [x] Remove all Base44 code
- [x] Install @supabase/supabase-js
- [x] Create AuthContext with Supabase auth
- [x] Auth pages: Login, Register, ForgotPassword, ResetPassword
- [x] ProtectedRoute with Supabase session check
- [x] App.jsx routing (public + protected)
- [x] Layout.jsx — logout button wired, real user name displayed
- [x] vipData.js — new VIP economics with trust_fee, profit ranges, bonds_to_complete
- [x] bondData.js — 100 demo bonds (10/VIP × 10 levels), 30 buyers, 9 upgrade teasers
- [x] TaskCenter.jsx — complete redesign with new flow, daily progress, upgrade teaser
- [x] BuyerSelection.jsx — 3-buyer animated selection, correct/wrong feedback
- [x] SalesContract.jsx — digital contract, phone input, signature animation
- [x] ClaimProfits.jsx — profit claim, task counter, 24h countdown, confetti
- [x] Landing.jsx — video hero support, updated language (sell/trade not invest)
- [x] AGENTS.md + CLAUDE.md updated for Supabase
- [x] Initial SQL schema (001_initial_schema.sql)
- [x] INSTRUCTIONS folder created
