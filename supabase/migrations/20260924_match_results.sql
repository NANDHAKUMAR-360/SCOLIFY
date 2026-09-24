-- ==================================================
-- SCOLIFY MATCH RESULTS TABLE MIGRATION
-- Part 06 Match Engine - Phase A
-- ==================================================

-- 1. Table Definition
CREATE TABLE IF NOT EXISTS public.match_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    eligibility_status TEXT NOT NULL,
    score INTEGER,
    score_version TEXT NOT NULL,
    factor_scores JSONB DEFAULT '{}'::jsonb,
    matched_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    missing_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    matched_criteria JSONB DEFAULT '{}'::jsonb,
    strengths TEXT[] DEFAULT ARRAY[]::TEXT[],
    gaps TEXT[] DEFAULT ARRAY[]::TEXT[],
    warnings TEXT[] DEFAULT ARRAY[]::TEXT[],
    explanation JSONB DEFAULT '{}'::jsonb,
    ai_explanation TEXT,
    is_stale BOOLEAN NOT NULL DEFAULT false,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_match_results_student_id ON public.match_results(student_id);
CREATE INDEX IF NOT EXISTS idx_match_results_opportunity_id ON public.match_results(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_match_results_score ON public.match_results(score);
CREATE INDEX IF NOT EXISTS idx_match_results_is_stale ON public.match_results(is_stale);
CREATE INDEX IF NOT EXISTS idx_match_results_generated_at ON public.match_results(generated_at);

-- 3. Uniqueness constraint for versioned results per student/opportunity
CREATE UNIQUE INDEX IF NOT EXISTS uq_match_results_student_opportunity_version ON public.match_results(student_id, opportunity_id, score_version);

-- 4. Row Level Security (RLS)
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;

-- Policy: students can view their own match results
DROP POLICY IF EXISTS "Students can view own match results" ON public.match_results;
CREATE POLICY "Students can view own match results" ON public.match_results
    FOR SELECT USING (
        auth.uid() = (SELECT profile_id FROM public.students WHERE id = match_results.student_id)
    );

-- Policy: students can insert their own match results
DROP POLICY IF EXISTS "Students can insert own match results" ON public.match_results;
CREATE POLICY "Students can insert own match results" ON public.match_results
    FOR INSERT WITH CHECK (
        auth.uid() = (SELECT profile_id FROM public.students WHERE id = match_results.student_id)
    );

-- Policy: students can update their own match results (e.g., marking stale)
DROP POLICY IF EXISTS "Students can update own match results" ON public.match_results;
CREATE POLICY "Students can update own match results" ON public.match_results
    FOR UPDATE USING (
        auth.uid() = (SELECT profile_id FROM public.students WHERE id = match_results.student_id)
    ) WITH CHECK (
        auth.uid() = (SELECT profile_id FROM public.students WHERE id = match_results.student_id)
    );

-- 5. Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_match_results_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_match_results_updated_at ON public.match_results;
CREATE TRIGGER trg_match_results_updated_at
    BEFORE UPDATE ON public.match_results
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_match_results_updated_at();

-- Note: Service role operations (backend) use the service_role key and bypass RLS.
