-- ==================================================
-- SCOLIFY POSTGRESQL DATABASE SCHEMA (PART 01 FOUNDATION)
-- Supabase Migration: 20260924_initial_schema.sql
-- ==================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum Types
CREATE TYPE opportunity_category AS ENUM (
    'scholarship',
    'internship',
    'fellowship',
    'competition',
    'grant',
    'research',
    'apprenticeship',
    'career',
    'other'
);

CREATE TYPE verification_status AS ENUM (
    'verified',
    'partially_verified',
    'unverified',
    'warning'
);

CREATE TYPE application_status AS ENUM (
    'draft',
    'in_review',
    'ready_for_approval',
    'approved',
    'submitted',
    'accepted',
    'rejected',
    'withdrawn'
);

CREATE TYPE agent_run_status AS ENUM (
    'pending',
    'running',
    'completed',
    'failed',
    'flagged'
);

-- 1. Profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Students Profile
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    bio TEXT,
    headline TEXT,
    date_of_birth DATE,
    country TEXT,
    state TEXT,
    city TEXT,
    preferred_categories opportunity_category[] DEFAULT '{scholarship,internship}',
    completion_percentage INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Education
CREATE TABLE IF NOT EXISTS public.education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    institution_name TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    gpa NUMERIC(3,2),
    max_gpa NUMERIC(3,2) DEFAULT 4.00,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Skills
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    proficiency_level TEXT DEFAULT 'intermediate',
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Interests
CREATE TABLE IF NOT EXISTS public.interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    interest_tag TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Documents Vault
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL, -- resume, transcript, essay, recommendation, portfolio
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type TEXT,
    extracted_metadata JSONB DEFAULT '{}'::jsonb,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Certifications
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    issuing_organization TEXT NOT NULL,
    issue_date DATE NOT NULL,
    expiration_date DATE,
    credential_id TEXT,
    credential_url TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Opportunities
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    organization_name TEXT NOT NULL,
    category opportunity_category NOT NULL,
    description TEXT NOT NULL,
    reward_amount NUMERIC(12,2),
    currency TEXT DEFAULT 'USD',
    location TEXT,
    is_remote BOOLEAN DEFAULT false,
    application_deadline TIMESTAMPTZ,
    official_url TEXT NOT NULL,
    verification_status verification_status DEFAULT 'unverified' NOT NULL,
    confidence_score NUMERIC(3,2) DEFAULT 0.85,
    verification_reasoning TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Opportunity Requirements
CREATE TABLE IF NOT EXISTS public.opportunity_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    requirement_type TEXT NOT NULL, -- gpa, degree, skill, location, essay
    criteria_json JSONB NOT NULL,
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. Opportunity Sources
CREATE TABLE IF NOT EXISTS public.opportunity_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    raw_payload JSONB DEFAULT '{}'::jsonb,
    crawled_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. Saved Opportunities
CREATE TABLE IF NOT EXISTS public.saved_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(student_id, opportunity_id)
);

-- 12. Applications
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    status application_status DEFAULT 'draft' NOT NULL,
    match_score NUMERIC(5,2),
    match_reasoning TEXT,
    missing_requirements JSONB DEFAULT '[]'::jsonb,
    human_approved BOOLEAN DEFAULT false NOT NULL,
    approved_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. Application Documents
CREATE TABLE IF NOT EXISTS public.application_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    purpose TEXT DEFAULT 'attachment',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 14. Application Events / History
CREATE TABLE IF NOT EXISTS public.application_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    event_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 15. Reminders
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 16. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 17. AI Insights
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL, -- match_breakdown, doc_gap, resume_tip
    content JSONB NOT NULL,
    confidence NUMERIC(3,2) DEFAULT 0.90,
    reasoning TEXT,
    warnings TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 18. Agent Runs
CREATE TABLE IF NOT EXISTS public.agent_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_name TEXT NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
    status agent_run_status DEFAULT 'pending' NOT NULL,
    input_params JSONB DEFAULT '{}'::jsonb,
    output_result JSONB DEFAULT '{}'::jsonb,
    execution_time_ms INT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 19. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id UUID,
    ip_address TEXT,
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Row Level Security (RLS) Policies Setup
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Sample RLS Policy Examples (Student Data Isolation)
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Students can view own data" ON public.students FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Students can update own data" ON public.students FOR UPDATE USING (auth.uid() = profile_id);
