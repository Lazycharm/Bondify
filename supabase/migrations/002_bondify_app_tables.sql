-- ============================================================
-- Bondify — App Tables Migration v2
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
-- Safe to re-run: drops conflicting objects from 001 first.
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- DROP objects from 001_initial_schema that conflict with this schema
-- (safe: cascade drops their policies and indexes automatically)
-- ============================================================
drop table if exists public.referrals   cascade;
drop table if exists public.achievements cascade;
drop table if exists public.check_ins   cascade;
drop table if exists public.gift_codes  cascade;
drop table if exists public.bond_tasks  cascade;
drop table if exists public.bonds       cascade;
drop table if exists public.wallets     cascade;
drop table if exists public.vip_levels  cascade;
drop table if exists public.transactions cascade;


-- ============================================================
-- PLATFORM CONFIG  (single-row settings table)
-- ============================================================
create table if not exists public.platform_config (
  id               int primary key default 1 check (id = 1),
  mtn_number       text not null default '',
  mtn_name         text not null default '',
  airtel_number    text not null default '',
  airtel_name      text not null default '',
  telegram_token   text not null default '',
  telegram_chat_id text not null default '',
  admin_emails     text[] not null default '{}',
  updated_at       timestamptz default now()
);

insert into public.platform_config (id) values (1) on conflict (id) do nothing;

alter table public.platform_config enable row level security;

drop policy if exists "config: admin only" on public.platform_config;

-- Helper: true when the calling user is an admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.platform_config
    where id = 1
      and (
        array_length(admin_emails, 1) is null   -- no emails set → open
        or auth.email() = any(admin_emails)
      )
  );
$$;

create policy "config: admin only"
  on public.platform_config
  for all
  using (public.is_admin());


-- ============================================================
-- DEPOSITS
-- ============================================================
create table if not exists public.deposits (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  user_email     text,
  amount         numeric not null check (amount > 0),
  network        text check (network in ('MTN Mobile Money','Airtel Money','Bank Transfer')),
  payment_ref    text,
  screenshot_url text,
  status         text not null default 'pending'
                 check (status in ('pending','approved','rejected')),
  admin_note     text,
  created_at     timestamptz not null default now()
);

create index if not exists deposits_user_id_idx on public.deposits (user_id);
create index if not exists deposits_status_idx  on public.deposits (status);

alter table public.deposits enable row level security;

drop policy if exists "deposits: user insert"  on public.deposits;
drop policy if exists "deposits: user select"  on public.deposits;
drop policy if exists "deposits: admin all"    on public.deposits;

create policy "deposits: user insert"
  on public.deposits for insert
  with check (auth.uid() = user_id);

create policy "deposits: user select"
  on public.deposits for select
  using (auth.uid() = user_id);

create policy "deposits: admin all"
  on public.deposits for all
  using (public.is_admin());


-- ============================================================
-- WITHDRAWALS
-- ============================================================
create table if not exists public.withdrawals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  user_email text,
  amount     numeric not null check (amount > 0),
  method     text check (method in ('MTN Mobile Money','Airtel Money','Bank Transfer')),
  account    text,
  status     text not null default 'pending'
             check (status in ('pending','approved','rejected')),
  admin_note text,
  created_at timestamptz not null default now()
);

create index if not exists withdrawals_user_id_idx on public.withdrawals (user_id);
create index if not exists withdrawals_status_idx  on public.withdrawals (status);

alter table public.withdrawals enable row level security;

drop policy if exists "withdrawals: user insert"  on public.withdrawals;
drop policy if exists "withdrawals: user select"  on public.withdrawals;
drop policy if exists "withdrawals: admin all"    on public.withdrawals;

create policy "withdrawals: user insert"
  on public.withdrawals for insert
  with check (auth.uid() = user_id);

create policy "withdrawals: user select"
  on public.withdrawals for select
  using (auth.uid() = user_id);

create policy "withdrawals: admin all"
  on public.withdrawals for all
  using (public.is_admin());


-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  message    text not null,
  type       text not null default 'info'
             check (type in ('info','success','warning','error')),
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications (user_id);
create index if not exists notifications_is_read_idx on public.notifications (user_id, is_read);

alter table public.notifications enable row level security;

drop policy if exists "notifications: user select"             on public.notifications;
drop policy if exists "notifications: user update (mark read)" on public.notifications;
drop policy if exists "notifications: admin all"               on public.notifications;

create policy "notifications: user select"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications: user update (mark read)"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "notifications: admin all"
  on public.notifications for all
  using (public.is_admin());


-- ============================================================
-- REFERRALS  (one row per referred user)
-- (dropped at the top, so create fresh here)
-- ============================================================
create table public.referrals (
  id               uuid primary key default gen_random_uuid(),
  referrer_id      text not null,        -- first 8 chars of referrer UUID (?ref= code)
  referrer_user_id uuid references auth.users(id) on delete set null,
  referred_user_id uuid references auth.users(id) on delete cascade,
  referred_email   text not null,
  level            int not null default 1,
  created_at       timestamptz not null default now()
);

create index referrals_referrer_id_idx      on public.referrals (referrer_id);
create index referrals_referred_user_id_idx on public.referrals (referred_user_id);

alter table public.referrals enable row level security;

create policy "referrals: user select own"
  on public.referrals for select
  using (referrer_user_id = auth.uid() or referred_user_id = auth.uid());

create policy "referrals: insert on register"
  on public.referrals for insert
  with check (auth.role() = 'authenticated');

create policy "referrals: admin all"
  on public.referrals for all
  using (public.is_admin());


-- ============================================================
-- GIFT CLAIMS  (daily gift — one claim per user per day)
-- ============================================================
create table if not exists public.gift_claims (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  amount     numeric not null,
  claimed_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, claimed_on)
);

create index if not exists gift_claims_user_id_idx on public.gift_claims (user_id);

alter table public.gift_claims enable row level security;

drop policy if exists "gift_claims: user own"  on public.gift_claims;
drop policy if exists "gift_claims: admin all" on public.gift_claims;

create policy "gift_claims: user own"
  on public.gift_claims for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "gift_claims: admin all"
  on public.gift_claims for all
  using (public.is_admin());


-- ============================================================
-- TASK STATES  (one row per user)
-- ============================================================
create table if not exists public.task_states (
  user_id            uuid references auth.users(id) on delete cascade primary key,
  total_completed    int not null default 0,
  session_day        int not null default 1,
  session_start_date date not null default current_date,
  completed_today    int not null default 0,
  last_day_date      date not null default current_date,
  countdown_end      timestamptz,
  updated_at         timestamptz not null default now()
);

alter table public.task_states enable row level security;

drop policy if exists "task_states: user own"  on public.task_states;
drop policy if exists "task_states: admin all" on public.task_states;

create policy "task_states: user own"
  on public.task_states for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "task_states: admin all"
  on public.task_states for all
  using (public.is_admin());


-- ============================================================
-- GRANTS
-- ============================================================
grant usage on schema public to authenticated;
grant all on all tables    in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
