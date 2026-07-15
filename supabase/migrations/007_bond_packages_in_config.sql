-- ============================================================
-- Migration 007 — Store bond packages in platform_config
-- Run in Supabase SQL editor
-- ============================================================

ALTER TABLE public.platform_config
  ADD COLUMN IF NOT EXISTS bond_packages JSONB;
