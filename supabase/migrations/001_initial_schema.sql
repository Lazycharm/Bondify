-- Enable UUID extension
create extension if not exists "pgcrypto";

-- VIP Levels (static seed table)
create table public.vip_levels (
  level int primary key,
  name text not null,
  min_investment numeric not null default 0,
  daily_tasks int not null default 0,
  daily_earnings_min numeric not null default 0,
  daily_earnings_max numeric not null default 0,
  perks text[] not null default '{}',
  color text
);

insert into public.vip_levels (level, name, min_investment, daily_tasks, daily_earnings_min, daily_earnings_max, perks, color) values
(1,  'Starter',  20000,    5,  2000,    4000,    array['5 daily tasks','Basic support','Withdrawal access'],        'from-slate-400 to-slate-500'),
(2,  'Bronze',   50000,    8,  5000,    9000,    array['8 daily tasks','Priority support','Referral boost'],         'from-amber-600 to-amber-700'),
(3,  'Silver',   100000,   10, 10000,   18000,   array['10 daily tasks','Weekly gift codes','Lower fees'],           'from-slate-300 to-slate-400'),
(4,  'Gold',     250000,   12, 25000,   45000,   array['12 daily tasks','VIP support','Bonus multiplier'],           'from-yellow-400 to-amber-500'),
(5,  'Platinum', 500000,   15, 50000,   90000,   array['15 daily tasks','Personal manager','Exclusive bonds'],       'from-cyan-300 to-teal-400'),
(6,  'Diamond',  1000000,  18, 100000,  180000,  array['18 daily tasks','Instant withdrawals','Premium gifts'],      'from-blue-300 to-indigo-400'),
(7,  'Emerald',  2000000,  20, 200000,  360000,  array['20 daily tasks','2x referral rate','VIP events'],            'from-emerald-400 to-green-500'),
(8,  'Sapphire', 5000000,  22, 500000,  900000,  array['22 daily tasks','Elite manager','Custom bonds'],             'from-sky-400 to-blue-500'),
(9,  'Ruby',     10000000, 25, 1000000, 1800000, array['25 daily tasks','Concierge service','Max rewards'],          'from-rose-400 to-red-500'),
(10, 'Crown',    0,        30, 2000000, 5000000, array['30 daily tasks','Founders club','Unlimited access'],         'from-amber-300 via-yellow-400 to-amber-500');

-- Wallets
create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  main_balance numeric not null default 0,
  bonus_balance numeric not null default 0,
  referral_earnings numeric not null default 0,
  pending_balance numeric not null default 0,
  withdrawable_balance numeric not null default 0,
  total_invested numeric not null default 0,
  today_profit numeric not null default 0,
  updated_at timestamptz default now()
);

-- Bonds
create table public.bonds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  bond_name text not null,
  bond_type text check (bond_type in ('Treasury Bill','Treasury Bond','Savings Bond','Infrastructure Bond')),
  vip_level int references public.vip_levels(level),
  investment_amount numeric not null default 0,
  maturity_days int,
  estimated_return numeric,
  reward numeric,
  status text not null default 'available' check (status in ('available','active','completed','pending')),
  progress numeric not null default 0,
  description text,
  created_at timestamptz default now()
);

-- Transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('deposit','withdrawal','investment','profit','bonus','referral','gift','checkin')),
  amount numeric not null,
  currency text not null default 'UGX',
  status text not null default 'completed' check (status in ('pending','processing','completed','failed','rejected')),
  description text,
  reference text,
  method text check (method in ('MTN Mobile Money','Airtel Money','Bank Transfer','Bonus','System')),
  created_at timestamptz default now()
);

-- Bond Tasks
create table public.bond_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  bond_id uuid references public.bonds(id) on delete set null,
  bond_name text not null,
  vip_level int,
  investment_amount numeric,
  estimated_return numeric,
  reward numeric,
  maturity_days int,
  status text not null default 'pending' check (status in ('pending','completed')),
  completed_date timestamptz,
  created_at timestamptz default now()
);

-- Gift Codes
create table public.gift_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  reward_amount numeric not null,
  status text not null default 'available' check (status in ('available','claimed','expired')),
  claimed_by uuid references auth.users(id) on delete set null,
  claimed_date timestamptz,
  expiry_date timestamptz,
  created_at timestamptz default now()
);

-- Referrals
create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  referral_code text not null unique,
  total_referrals int not null default 0,
  level_1_count int not null default 0,
  level_2_count int not null default 0,
  level_3_count int not null default 0,
  total_earnings numeric not null default 0,
  leaderboard_rank int not null default 0,
  created_at timestamptz default now()
);

-- Achievements
create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  icon text,
  tier text check (tier in ('bronze','silver','gold','platinum')),
  earned boolean not null default false,
  earned_date timestamptz,
  progress numeric not null default 0,
  created_at timestamptz default now()
);

-- Check-ins
create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  streak_days int not null default 0,
  last_checkin_date date,
  total_checkins int not null default 0,
  reward_today numeric not null default 300,
  milestones_reached int[] not null default '{}',
  updated_at timestamptz default now()
);

-- RLS: enable on all tables
alter table public.vip_levels enable row level security;
alter table public.wallets enable row level security;
alter table public.bonds enable row level security;
alter table public.transactions enable row level security;
alter table public.bond_tasks enable row level security;
alter table public.gift_codes enable row level security;
alter table public.referrals enable row level security;
alter table public.achievements enable row level security;
alter table public.check_ins enable row level security;

-- RLS policies
create policy "vip_levels: read all" on public.vip_levels for select using (true);

create policy "wallets: own rows" on public.wallets for all using (auth.uid() = user_id);
create policy "bonds: own rows" on public.bonds for all using (auth.uid() = user_id);
create policy "transactions: own rows" on public.transactions for all using (auth.uid() = user_id);
create policy "bond_tasks: own rows" on public.bond_tasks for all using (auth.uid() = user_id);
create policy "referrals: own rows" on public.referrals for all using (auth.uid() = user_id);
create policy "achievements: own rows" on public.achievements for all using (auth.uid() = user_id);
create policy "check_ins: own rows" on public.check_ins for all using (auth.uid() = user_id);

create policy "gift_codes: read all" on public.gift_codes for select using (auth.role() = 'authenticated');
create policy "gift_codes: claim own" on public.gift_codes for update using (auth.uid() = claimed_by or claimed_by is null);
