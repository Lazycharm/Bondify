-- ============================================================
-- Migration 006 — Security hardening & missing admin policies
-- Run in Supabase SQL editor
-- ============================================================

-- Fix is_admin() to be case-insensitive on email comparison
-- Prevents mismatch when admin email stored with different casing
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_config
    WHERE id = 1
      AND (
        array_length(admin_emails, 1) IS NULL
        OR lower(auth.email()) = ANY(
             SELECT lower(e) FROM unnest(admin_emails) e
           )
      )
  );
$$;

-- Add admin policy to profiles table (migration 003 omitted this)
DROP POLICY IF EXISTS "profiles: admin all" ON public.profiles;
CREATE POLICY "profiles: admin all"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- Add admin policy to user_wallets (migration 005 omitted admin access)
DROP POLICY IF EXISTS "wallet: admin all" ON public.user_wallets;
CREATE POLICY "wallet: admin all"
  ON public.user_wallets FOR ALL
  USING (public.is_admin());

-- Add composite index on deposits for faster admin queries
CREATE INDEX IF NOT EXISTS deposits_created_at_idx ON public.deposits (created_at DESC);
CREATE INDEX IF NOT EXISTS withdrawals_created_at_idx ON public.withdrawals (created_at DESC);

-- Ensure deposits network constraint covers all mapped values
-- (The frontend maps bank transfers too, even though original schema only had MTN/Airtel)
ALTER TABLE public.deposits
  DROP CONSTRAINT IF EXISTS deposits_network_check;
ALTER TABLE public.deposits
  ADD CONSTRAINT deposits_network_check
  CHECK (network IN ('MTN Mobile Money', 'Airtel Money', 'Bank Transfer'));

-- Add updated_at to deposits and withdrawals for audit trail
ALTER TABLE public.deposits
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

ALTER TABLE public.withdrawals
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Auto-update updated_at on status changes
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS deposits_updated_at ON public.deposits;
CREATE TRIGGER deposits_updated_at
  BEFORE UPDATE ON public.deposits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS withdrawals_updated_at ON public.withdrawals;
CREATE TRIGGER withdrawals_updated_at
  BEFORE UPDATE ON public.withdrawals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
