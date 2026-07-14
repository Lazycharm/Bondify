-- =============================================
-- Bondify Supabase Migration
-- Run these in the Supabase SQL Editor
-- =============================================

-- 1. PROFILES TABLE
-- Stores user display name synced from auth.users metadata
-- (Supabase Auth already stores full_name in user_metadata via signUp options.data)

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- NOTE: The following tables are for FUTURE
-- migration from localStorage to Supabase.
-- The current app uses localStorage exclusively.
-- Run these when you're ready to migrate.
-- =============================================

-- 2. BOND INVESTMENTS TABLE (future migration)
CREATE TABLE IF NOT EXISTS public.bond_investments (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  color TEXT,
  price INTEGER NOT NULL,
  daily_income INTEGER NOT NULL,
  total_income INTEGER NOT NULL,
  term_days INTEGER NOT NULL,
  days_completed INTEGER DEFAULT 0,
  total_credited INTEGER DEFAULT 0,
  last_credited_date DATE,
  is_active BOOLEAN DEFAULT true,
  started_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bond_investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own bonds" ON public.bond_investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own bonds" ON public.bond_investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own bonds" ON public.bond_investments
  FOR UPDATE USING (auth.uid() = user_id);

-- 3. REFERRALS TABLE (future migration)
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id TEXT NOT NULL,         -- 8-char code (userId.slice(0,8).toUpperCase())
  referred_email TEXT NOT NULL UNIQUE,
  referred_user_id UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see referrals they made" ON public.referrals
  FOR SELECT USING (
    referrer_id = substring(auth.uid()::text, 1, 8)
  );

-- 4. ADMIN ADJUSTMENTS TABLE (future migration)
CREATE TABLE IF NOT EXISTS public.admin_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  note TEXT,
  admin_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_adjustments ENABLE ROW LEVEL SECURITY;

-- Only service role can write adjustments (admin-only operation)
CREATE POLICY "Users read own adjustments" ON public.admin_adjustments
  FOR SELECT USING (auth.uid() = user_id);
