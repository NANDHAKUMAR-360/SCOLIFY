-- ==================================================
-- SCOLIFY POSTGRESQL DATABASE MIGRATION (PART 04 INGESTION & VERIFICATION)
-- Supabase Migration: 20260924_part04_opportunity_ingestion.sql
-- ==================================================

-- 1. Ingestion Runs Table
CREATE TABLE IF NOT EXISTS public.ingestion_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_name TEXT NOT NULL,
    source_type TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ,
    total_records INT DEFAULT 0,
    successful_records INT DEFAULT 0,
    rejected_records INT DEFAULT 0,
    duplicate_records INT DEFAULT 0,
    expired_records INT DEFAULT 0,
    verification_pending_records INT DEFAULT 0,
    status TEXT DEFAULT 'running' NOT NULL,
    errors JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Add ingestion_run_id foreign key to opportunities
ALTER TABLE public.opportunities 
  ADD COLUMN IF NOT EXISTS ingestion_run_id UUID REFERENCES public.ingestion_runs(id) ON DELETE SET NULL;

-- 3. Enable RLS on ingestion_runs
ALTER TABLE public.ingestion_runs ENABLE ROW LEVEL SECURITY;

-- Allow read/write for service role and admin inspection
DROP POLICY IF EXISTS "Admins & Service Role can access ingestion_runs" ON public.ingestion_runs;
CREATE POLICY "Admins & Service Role can access ingestion_runs" 
  ON public.ingestion_runs FOR ALL 
  USING (true);
