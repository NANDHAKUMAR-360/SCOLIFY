-- ============================================================================
-- SCOLIFY PART 07: APPLICATION PREPARATION & DOCUMENT INTELLIGENCE MIGRATION
-- ============================================================================

-- 1. Extend documents table with expiration, verification status, and storage metadata
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'student_upload';

-- Add check constraint for verification_status if not existing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'documents_verification_status_check'
  ) THEN
    ALTER TABLE public.documents
    ADD CONSTRAINT documents_verification_status_check
    CHECK (verification_status IN ('unverified', 'pending_verification', 'verified', 'rejected', 'expired'));
  END IF;
END $$;

-- 2. Extend applications table with notes, draft content, and readiness metadata
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS draft_content JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS application_answers JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS readiness_snapshot JSONB DEFAULT '{}'::jsonb;

-- 3. Ensure Row Level Security (RLS) Policies on documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- View policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can view own documents') THEN
    CREATE POLICY "Students can view own documents"
    ON public.documents FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = documents.student_id AND s.profile_id = auth.uid()
      )
    );
  END IF;

  -- Insert policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can insert own documents') THEN
    CREATE POLICY "Students can insert own documents"
    ON public.documents FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = documents.student_id AND s.profile_id = auth.uid()
      )
    );
  END IF;

  -- Update policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can update own documents') THEN
    CREATE POLICY "Students can update own documents"
    ON public.documents FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = documents.student_id AND s.profile_id = auth.uid()
      )
    );
  END IF;

  -- Delete policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can delete own documents') THEN
    CREATE POLICY "Students can delete own documents"
    ON public.documents FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = documents.student_id AND s.profile_id = auth.uid()
      )
    );
  END IF;
END $$;

-- 4. Ensure RLS Policies on application_documents
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can manage own application documents') THEN
    CREATE POLICY "Students can manage own application documents"
    ON public.application_documents FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.students s ON s.id = a.student_id
        WHERE a.id = application_documents.application_id AND s.profile_id = auth.uid()
      )
    );
  END IF;
END $$;

-- 5. Create storage bucket for private student documents if storage schema exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'student-documents',
      'student-documents',
      false, -- strictly private bucket
      15728640, -- 15MB limit
      ARRAY['application/pdf', 'image/png', 'image/jpeg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    )
    ON CONFLICT (id) DO UPDATE SET public = false;
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_student_id ON public.documents(student_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_application_documents_app_id ON public.application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_applications_student_opp ON public.applications(student_id, opportunity_id);
