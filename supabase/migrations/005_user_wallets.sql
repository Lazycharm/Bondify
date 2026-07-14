-- ============================================================
-- Migration 005 — User wallet data (gift credits + bond deductions)
-- Solves cross-device balance mismatch
-- Run in Supabase SQL editor AFTER 004_fix_config_and_rls.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_wallets (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gift_credits  BIGINT NOT NULL DEFAULT 0,
  bond_deductions BIGINT NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallet: user read own"
  ON public.user_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "wallet: user insert own"
  ON public.user_wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wallet: user update own"
  ON public.user_wallets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
