-- ============================================================
-- Migration 008 — user_bonds, notifications, task state in user_wallets
-- Run in Supabase SQL editor
-- ============================================================

-- user_bonds
CREATE TABLE IF NOT EXISTS public.user_bonds (
  id                TEXT       PRIMARY KEY,
  user_id           UUID       NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id        TEXT       NOT NULL,
  product_name      TEXT       NOT NULL DEFAULT '',
  color             TEXT       NOT NULL DEFAULT '',
  price             BIGINT     NOT NULL DEFAULT 0,
  daily_income      BIGINT     NOT NULL DEFAULT 0,
  total_income      BIGINT     NOT NULL DEFAULT 0,
  term_days         INT        NOT NULL DEFAULT 360,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_credited_date TEXT      NOT NULL DEFAULT '',
  total_credited    BIGINT     NOT NULL DEFAULT 0,
  days_completed    INT        NOT NULL DEFAULT 0,
  is_active         BOOLEAN    NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.user_bonds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bonds: user own" ON public.user_bonds;
DROP POLICY IF EXISTS "bonds: admin all" ON public.user_bonds;
CREATE POLICY "bonds: user own" ON public.user_bonds FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bonds: admin all" ON public.user_bonds FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id         TEXT       PRIMARY KEY,
  user_id    UUID       NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message    TEXT       NOT NULL,
  type       TEXT       NOT NULL DEFAULT 'info',
  read       BOOLEAN    NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifs: user read own" ON public.notifications;
DROP POLICY IF EXISTS "notifs: user update own" ON public.notifications;
DROP POLICY IF EXISTS "notifs: admin insert" ON public.notifications;
CREATE POLICY "notifs: user read own"   ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifs: user update own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifs: admin insert"    ON public.notifications FOR INSERT WITH CHECK (public.is_admin());

-- Extend user_wallets with task state + flow + vip override + check-in + gift + profile
ALTER TABLE public.user_wallets
  ADD COLUMN IF NOT EXISTS task_flow              TEXT NOT NULL DEFAULT 'daily',
  ADD COLUMN IF NOT EXISTS sales_activated_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS task_completed_today   INT  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS task_total_completed   INT  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS task_session_day       INT  NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS task_last_day_date     TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS task_countdown_end     BIGINT,
  ADD COLUMN IF NOT EXISTS vip_level_override     INT,
  ADD COLUMN IF NOT EXISTS last_checkin_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_gift_claimed_date TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS profile_name           TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS profile_phone          TEXT NOT NULL DEFAULT '';

-- Add first_deposit_bonus column to platform_config
ALTER TABLE public.platform_config
  ADD COLUMN IF NOT EXISTS first_deposit_bonus TEXT NOT NULL DEFAULT '5000';

-- RPC: admin atomically adjusts gift_credits for a target user
CREATE OR REPLACE FUNCTION public.admin_adjust_gift_credits(p_user_id UUID, p_amount BIGINT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Permission denied'; END IF;
  INSERT INTO public.user_wallets (user_id, gift_credits)
    VALUES (p_user_id, GREATEST(0, p_amount))
  ON CONFLICT (user_id) DO UPDATE
    SET gift_credits = GREATEST(0, user_wallets.gift_credits + p_amount),
        updated_at   = NOW();
END;
$$;
