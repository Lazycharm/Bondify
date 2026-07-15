# Bondify — Claude Context

Treasury bonds investment platform targeting Uganda. React + Vite frontend on Vercel, Supabase for auth and database.

## What this is

Bondify lets users invest UGX in government treasury bonds across 10 VIP tiers (Starter → Crown). Users earn daily returns, complete bond tasks, claim gift codes, refer friends, and track achievements. Payment via MTN Mobile Money, Airtel Money, or Bank Transfer.

## Stack

React 18 · Vite 6 · Tailwind 3 · shadcn/ui · Supabase · Vercel · Framer Motion · Recharts · React Query · React Router v6

## Key files

- `src/api/supabaseClient.js` — Supabase singleton, import `supabase` from here
- `src/lib/AuthContext.jsx` — auth state via `useAuth()` hook
- `src/lib/vipData.js` — `VIP_LEVELS` array, `formatUGX()`, `formatUGXShort()`
- `src/lib/supabase_ops.js` — ALL Supabase read/write helpers; never query supabase directly in components
- `src/lib/paymentSettings.js` — `getPaymentSettings()` / `savePaymentSettings()`; synced to `platform_config` table
- `src/lib/depositStore.js` — wallet balance calc; reads several localStorage keys that are populated from Supabase on login
- `AGENTS.md` — full schema, file structure, deployment guide

## Rules

- No Base44 imports — everything is Supabase now
- No mock/demo data in production — query Supabase
- Currency is always UGX — use `formatUGX()`/`formatUGXShort()` helpers
- RLS must be enabled on every Supabase table
- `user_id` links every row to `auth.users`
- Never write localStorage directly for user data — use the helpers in `supabase_ops.js` so data syncs across devices
- localStorage is a write-through cache only; Supabase is the source of truth

## Auth

Supabase Auth. Email+password with OTP verification. Google OAuth supported. Password reset via magic link to `/reset-password`. Protected routes use `<ProtectedRoute>`.

## Database tables (actual, as of migration 008)

| Table | Purpose |
|---|---|
| `platform_config` | Single row (id=1) — all admin settings: payment accounts, fees, lock periods, referral rates, gift amounts, first_deposit_bonus, bond_packages |
| `deposits` | User deposit records with status (pending/approved/rejected) |
| `withdrawals` | User withdrawal requests |
| `user_wallets` | Per-user financial state — gift_credits, bond_deductions, task flow, task state, VIP override, check-in timestamp, gift claim date, profile name/phone |
| `user_bonds` | Active bond investments per user — daily_income, total_credited, days_completed, is_active |
| `notifications` | Admin-written notifications delivered to specific users |
| `referrals` | Referral relationships and earnings |

### `user_wallets` key columns
`gift_credits` · `bond_deductions` · `task_flow` · `sales_activated_at` · `task_completed_today` · `task_total_completed` · `task_session_day` · `task_last_day_date` · `task_countdown_end` · `vip_level_override` · `last_checkin_at` · `last_gift_claimed_date` · `profile_name` · `profile_phone`

## Supabase sync architecture

`syncAllUserData(userId)` runs on every login and calls in parallel:
- `syncUserDeposits` — deposits → localStorage
- `syncWithdrawals` — withdrawals → localStorage
- `syncPaymentSettings` — platform_config → localStorage
- `syncUserReferrals` — referrals → localStorage
- `syncWalletData` — gift_credits, bond_deductions, admin_gifts → localStorage
- `syncReferralEarnings` — referral_earnings → localStorage
- `syncUserBonds` — user_bonds → localStorage; rebuilds bond income total
- `syncUserTaskState` — task state, flow, VIP override, check-in, gift claim, profile → localStorage
- `syncNotifications` — notifications → localStorage

Upload helpers (called after user actions): `uploadUserBond`, `uploadAllUserBonds`, `uploadUserTaskState`, `uploadUserFlow`, `uploadCheckIn`, `uploadDailyGiftClaim`, `uploadUserProfile`, `uploadWalletData`, `uploadWithdrawal`, `saveDepositToSupabase`.

## Admin-configurable settings (platform_config / AdminConfig page)

All settings are in `getPaymentSettings()`. Key ones:
- `first_deposit_bonus` — UGX amount credited on first approved deposit (default 5000)
- `daily_gift_amount` — UGX credited when user opens daily gift box
- `referral_lv1/lv2/lv3` — commission rates (%)
- `daily_lock_hrs` / `sales_lock_days` — withdrawal lock periods
- `withdrawal_fee_pct`, `withdrawal_min_amount`, `withdrawal_max_amount`
- `mtn_number/name`, `airtel_number/name` — payment accounts
- `telegram_token`, `telegram_chat_id` — Telegram bot credentials
- `admin_emails` — comma-separated admin email whitelist
- `bond_packages` — JSON array of bond product definitions

## Admin RPC

`admin_adjust_gift_credits(p_user_id, p_amount)` — server-side function to atomically add/subtract gift credits for any user. Only callable by admins (checked via `is_admin()`). Used by AdminUsers page balance adjustment.

## Migrations

Run in order in Supabase SQL editor. Latest: `supabase/migrations/008_bonds_notifications_taskstate.sql`

## Deploy

Vercel + Supabase. See `AGENTS.md` for env vars and migration steps.
