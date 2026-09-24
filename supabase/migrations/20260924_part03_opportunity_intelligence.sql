-- ==================================================
-- SCOLIFY POSTGRESQL DATABASE MIGRATION (PART 03 OPPORTUNITY INTELLIGENCE)
-- Supabase Migration: 20260924_part03_opportunity_intelligence.sql
-- ==================================================

-- Extend opportunities table with lifecycle, duplicate detection, and audit fields
ALTER TABLE public.opportunities 
  ADD COLUMN IF NOT EXISTS lifecycle_status TEXT DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS duplicate_status TEXT DEFAULT 'unique',
  ADD COLUMN IF NOT EXISTS expiry_status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Extend opportunity_sources table with last_verified_at and provenance metadata
ALTER TABLE public.opportunity_sources
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'web_crawl';

-- Enable RLS on opportunities and sources
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;

-- Public & Authenticated Student Read Policy for Active Published VERIFIED Opportunities ONLY
DROP POLICY IF EXISTS "Public & Students can read verified active opportunities" ON public.opportunities;

CREATE POLICY "Public & Students can read verified active opportunities" 
  ON public.opportunities FOR SELECT 
  USING (is_active = true AND verification_status = 'verified' AND (lifecycle_status = 'published' OR lifecycle_status IS NULL));

CREATE POLICY "Students can read opportunity requirements"
  ON public.opportunity_requirements FOR SELECT 
  USING (true);

CREATE POLICY "Students can read opportunity sources"
  ON public.opportunity_sources FOR SELECT 
  USING (true);

-- Saved Opportunities RLS Policies
CREATE POLICY "Students can read own saved opportunities" 
  ON public.saved_opportunities FOR SELECT 
  USING (auth.uid() IN (SELECT profile_id FROM public.students WHERE id = student_id));

CREATE POLICY "Students can insert own saved opportunities" 
  ON public.saved_opportunities FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT profile_id FROM public.students WHERE id = student_id));

CREATE POLICY "Students can delete own saved opportunities" 
  ON public.saved_opportunities FOR DELETE 
  USING (auth.uid() IN (SELECT profile_id FROM public.students WHERE id = student_id));
