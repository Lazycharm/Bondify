-- ============================================================
-- Migration 006 — Referral earnings table + credit RPC
-- Tracks commissions earned from referrals server-side
-- Run in Supabase SQL editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.referral_earnings (
  referrer_code TEXT PRIMARY KEY,          -- first 8 chars of user_id, uppercase
  total_earned  BIGINT NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.referral_earnings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ref_earnings: user read own" ON public.referral_earnings;
DROP POLICY IF EXISTS "ref_earnings: admin all"     ON public.referral_earnings;

-- Users can read only their own row (code matches their user_id prefix)
CREATE POLICY "ref_earnings: user read own"
  ON public.referral_earnings FOR SELECT
  USING (referrer_code = upper(substring(auth.uid()::text, 1, 8)));

-- Admin can do everything
CREATE POLICY "ref_earnings: admin all"
  ON public.referral_earnings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Atomic increment RPC ──────────────────────────────────────
-- SECURITY DEFINER so it runs with elevated privileges.
-- Checks is_admin() internally to prevent abuse.
DROP FUNCTION IF EXISTS public.credit_referral_commission(TEXT, BIGINT);

CREATE OR REPLACE FUNCTION public.credit_referral_commission(p_code TEXT, p_amount BIGINT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;
  IF p_amount <= 0 THEN RETURN; END IF;

  INSERT INTO public.referral_earnings (referrer_code, total_earned, updated_at)
  VALUES (p_code, p_amount, NOW())
  ON CONFLICT (referrer_code)
  DO UPDATE SET
    total_earned = referral_earnings.total_earned + p_amount,
    updated_at   = NOW();
END;
$$;
