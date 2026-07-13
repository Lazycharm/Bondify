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
- `AGENTS.md` — full schema, file structure, deployment guide

## Rules

- No Base44 imports — everything is Supabase now
- No mock/demo data in production — query Supabase
- Currency is always UGX — use `formatUGX()`/`formatUGXShort()` helpers
- RLS must be enabled on every Supabase table
- `user_id` links every row to `auth.users`

## Auth

Supabase Auth. Email+password with OTP verification. Google OAuth supported. Password reset via magic link to `/reset-password`. Protected routes use `<ProtectedRoute>`.

## Deploy

Vercel + Supabase. See `AGENTS.md` for env vars and migration steps.
