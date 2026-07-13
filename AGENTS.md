# Bondify — Agent Context

Treasury bonds investment platform for the Ugandan market. Users deposit UGX, invest in bonds across 10 VIP tiers, earn daily returns, complete tasks, and receive referral rewards.

## Tech Stack

- **Frontend:** React 18 + Vite 6 + Tailwind CSS 3 + shadcn/ui (Radix primitives)
- **Auth & DB:** Supabase (PostgreSQL + Supabase Auth)
- **Deployment:** Vercel (frontend) + Supabase (backend)
- **Animation:** Framer Motion
- **Charts:** Recharts
- **Data fetching:** @tanstack/react-query
- **Routing:** React Router DOM v6

## Environment Variables

Copy `.env.example` → `.env.local` and fill in:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase Client

`src/api/supabaseClient.js` — single export `supabase`. Import it everywhere DB/auth is needed.

## Auth

Handled by Supabase Auth via `src/lib/AuthContext.jsx`. The context exposes:
- `user` — Supabase user object (null if not logged in)
- `isAuthenticated` — boolean
- `isLoadingAuth` — boolean
- `logout()` — signs out and redirects to /login
- `navigateToLogin()` — redirects to /login

Protected routes: wrap with `<ProtectedRoute>` from `src/components/ProtectedRoute.jsx`.

## Database Schema

All tables belong to `auth.users` via `user_id` foreign key. Enable Row Level Security on every table.

### `bonds`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK auth.users |
| bond_name | text | |
| bond_type | text | Treasury Bill / Treasury Bond / Savings Bond / Infrastructure Bond |
| vip_level | int | 1–10 |
| investment_amount | numeric | UGX |
| maturity_days | int | |
| estimated_return | numeric | |
| reward | numeric | |
| status | text | available / active / completed / pending |
| progress | numeric | 0–100 |
| description | text | |

### `wallets`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK auth.users, unique |
| main_balance | numeric | default 0 |
| bonus_balance | numeric | default 0 |
| referral_earnings | numeric | default 0 |
| pending_balance | numeric | default 0 |
| withdrawable_balance | numeric | default 0 |
| total_invested | numeric | default 0 |
| today_profit | numeric | default 0 |

### `transactions`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK auth.users |
| type | text | deposit / withdrawal / investment / profit / bonus / referral / gift / checkin |
| amount | numeric | |
| currency | text | default 'UGX' |
| status | text | pending / processing / completed / failed / rejected |
| description | text | |
| reference | text | |
| method | text | MTN Mobile Money / Airtel Money / Bank Transfer / Bonus / System |
| created_at | timestamptz | default now() |

### `vip_levels`
Seeded static table — do not modify at runtime.
| Column | Type |
|---|---|
| level | int PK |
| name | text |
| min_investment | numeric |
| daily_tasks | int |
| daily_earnings_min | numeric |
| daily_earnings_max | numeric |
| perks | text[] |
| color | text |

### `bond_tasks`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK auth.users |
| bond_id | uuid | FK bonds |
| bond_name | text | |
| vip_level | int | |
| investment_amount | numeric | |
| estimated_return | numeric | |
| reward | numeric | |
| maturity_days | int | |
| status | text | pending / completed |
| completed_date | timestamptz | |

### `gift_codes`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| code | text | unique |
| reward_amount | numeric | |
| status | text | available / claimed / expired |
| claimed_by | uuid | FK auth.users |
| claimed_date | timestamptz | |
| expiry_date | timestamptz | |

### `referrals`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK auth.users, unique |
| referral_code | text | unique |
| total_referrals | int | default 0 |
| level_1_count | int | default 0 |
| level_2_count | int | default 0 |
| level_3_count | int | default 0 |
| total_earnings | numeric | default 0 |
| leaderboard_rank | int | default 0 |

### `achievements`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK auth.users |
| name | text | |
| description | text | |
| icon | text | |
| tier | text | bronze / silver / gold / platinum |
| earned | boolean | default false |
| earned_date | timestamptz | |
| progress | numeric | default 0 |

### `check_ins`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK auth.users, unique |
| streak_days | int | default 0 |
| last_checkin_date | date | |
| total_checkins | int | default 0 |
| reward_today | numeric | default 300 |
| milestones_reached | int[] | |

## File Structure

```
src/
├── api/
│   └── supabaseClient.js     ← Supabase client singleton
├── components/
│   ├── ui/                   ← shadcn/ui components
│   ├── Layout.jsx            ← App shell (sidebar + top bar + BottomNav)
│   ├── AuthLayout.jsx        ← Centered auth page wrapper
│   ├── BottomNav.jsx         ← Mobile navigation
│   ├── LiveActivityFeed.jsx
│   ├── ParticleBackground.jsx
│   ├── ProtectedRoute.jsx
│   └── ScrollToTop.jsx
├── lib/
│   ├── AuthContext.jsx       ← Supabase auth state
│   ├── ThemeContext.jsx      ← Dark/light mode
│   ├── query-client.js       ← React Query client
│   ├── vipData.js            ← VIP_LEVELS config + formatUGX helpers
│   ├── sound.js              ← playSound utility
│   └── utils.js              ← cn() helper
├── pages/
│   ├── Dashboard.jsx
│   ├── WalletPage.jsx
│   ├── Portfolio.jsx
│   ├── TaskCenter.jsx
│   ├── VipLevels.jsx
│   ├── DailyGift.jsx
│   ├── Referrals.jsx
│   ├── Achievements.jsx
│   ├── Support.jsx
│   ├── Marketplace.jsx
│   ├── TransactionDetails.jsx
│   ├── Withdrawals.jsx
│   ├── Profile.jsx
│   ├── Calculator.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── ForgotPassword.jsx
│   ├── ResetPassword.jsx
│   └── Landing.jsx
└── App.jsx                   ← Routes
```

## Currency

Always display UGX. Use `formatUGX(n)` or `formatUGXShort(n)` from `src/lib/vipData.js`.

## VIP Levels

10 tiers: Starter → Bronze → Silver → Gold → Platinum → Diamond → Emerald → Sapphire → Ruby → Crown. Config in `src/lib/vipData.js` as `VIP_LEVELS` array. Level 10 (Crown) is invite-only.

## Payment Methods

MTN Mobile Money, Airtel Money, Bank Transfer. No card payments — mobile money first market.

## Deployment

- **Vercel:** Connect GitHub repo. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel env vars.
- **Supabase:** Create project, run migrations, enable RLS on all tables, enable Google OAuth provider.

## Conventions

- No mock/placeholder data in production — query Supabase for real data.
- All DB queries go through `@tanstack/react-query` with `queryKey` arrays.
- Use `useAuth()` hook for auth state, never read Supabase auth directly in components.
- Component files use PascalCase. Utility files use camelCase.
- Run `npm run lint` before finishing any code changes.
