-- ============================================================
-- Migration 004 — Fix platform_config schema + RLS
-- Run in Supabase SQL editor
-- ============================================================

-- Add all extended settings columns to platform_config
ALTER TABLE public.platform_config
  ADD COLUMN IF NOT EXISTS withdrawal_fee_pct    text NOT NULL DEFAULT '0',
  ADD COLUMN IF NOT EXISTS withdrawal_min_amount text NOT NULL DEFAULT '10000',
  ADD COLUMN IF NOT EXISTS withdrawal_max_amount text NOT NULL DEFAULT '0',
  ADD COLUMN IF NOT EXISTS daily_lock_hrs        text NOT NULL DEFAULT '24',
  ADD COLUMN IF NOT EXISTS sales_lock_days       text NOT NULL DEFAULT '30',
  ADD COLUMN IF NOT EXISTS daily_deposit_min     text NOT NULL DEFAULT '20000',
  ADD COLUMN IF NOT EXISTS daily_deposit_max     text NOT NULL DEFAULT '0',
  ADD COLUMN IF NOT EXISTS sales_deposit_min     text NOT NULL DEFAULT '20000',
  ADD COLUMN IF NOT EXISTS sales_deposit_max     text NOT NULL DEFAULT '0',
  ADD COLUMN IF NOT EXISTS referral_lv1          text NOT NULL DEFAULT '5',
  ADD COLUMN IF NOT EXISTS referral_lv2          text NOT NULL DEFAULT '2',
  ADD COLUMN IF NOT EXISTS referral_lv3          text NOT NULL DEFAULT '1',
  ADD COLUMN IF NOT EXISTS support_telegram_link text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS daily_gift_amount     text NOT NULL DEFAULT '1000';

-- Fix RLS: split read (all authenticated) from write (admin only)
-- This allows users to read MTN/Airtel numbers and Telegram settings
DROP POLICY IF EXISTS "config: admin only" ON public.platform_config;

CREATE POLICY "config: authenticated read"
  ON public.platform_config FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "config: admin write"
  ON public.platform_config FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "config: admin update"
  ON public.platform_config FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Ensure there is always exactly one row
INSERT INTO public.platform_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
