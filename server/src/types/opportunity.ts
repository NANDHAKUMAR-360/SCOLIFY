export type OpportunityCategory =
  | 'scholarship'
  | 'internship'
  | 'fellowship'
  | 'competition'
  | 'grant'
  | 'research'
  | 'apprenticeship'
  | 'career'
  | 'other';

export type VerificationStatus =
  | 'verified'
  | 'partially_verified'
  | 'unverified'
  | 'warning'
  | 'needs_review';

export type LifecycleStatus =
  | 'collected'
  | 'normalized'
  | 'validating'
  | 'duplicate_check'
  | 'expiry_check'
  | 'verification_pending'
  | 'admin_review'
  | 'verified'
  | 'published'
  | 'rejected'
  | 'expired'
  | 'duplicate';

export type DuplicateStatus = 'unique' | 'exact_duplicate' | 'possible_duplicate';

export type ExpiryStatus = 'active' | 'expiring_soon' | 'expired' | 'no_deadline';

export interface StructuredRequirement {
  id?: string;
  opportunity_id?: string;
  requirement_type: string; // gpa, degree, skill, location, essay, experience
  criteria_json: {
    field?: string;
    operator?: 'EQUALS' | 'CONTAINS' | 'GREATER_THAN_OR_EQUAL' | 'LESS_THAN_OR_EQUAL' | 'IN_LIST';
    value?: any;
    unit?: string;
    description?: string;
  };
  is_mandatory: boolean;
}

export interface OpportunitySourceRecord {
  id?: string;
  opportunity_id?: string;
  source_name: string;
  source_url: string;
  source_type?: string;
  raw_payload?: Record<string, any>;
  crawled_at?: string;
  last_verified_at?: string;
}

export interface ServerOpportunity {
  id: string;
  title: string;
  organization_name: string;
  category: OpportunityCategory;
  description: string;
  reward_amount?: number;
  currency?: string;
  location?: string;
  is_remote: boolean;
  application_deadline?: string;
  official_url: string;
  verification_status: VerificationStatus;
  confidence_score: number;
  verification_reasoning?: string;
  lifecycle_status: LifecycleStatus;
  duplicate_status: DuplicateStatus;
  expiry_status: ExpiryStatus;
  verified_by?: string;
  verified_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  sources?: OpportunitySourceRecord[];
  requirements?: StructuredRequirement[];
  is_saved?: boolean;
}

export interface OpportunityFilterQuery {
  category?: string;
  search?: string;
  location?: string;
  isRemote?: boolean;
  verificationStatus?: string;
  lifecycleStatus?: string;
  includeUnpublished?: boolean;
  deadline?: string;
  page?: number;
  limit?: number;
  studentId?: string;
}

export type SourceType =
  | 'OFFICIAL_GOVERNMENT'
  | 'OFFICIAL_COMPANY'
  | 'OFFICIAL_UNIVERSITY'
  | 'OFFICIAL_FOUNDATION'
  | 'AUTHORIZED_PARTNER'
  | 'CURATED'
  | 'MANUAL'
  | 'API'
  | 'RSS'
  | 'DEMO';

export interface SourceMetadata {
  sourceName: string;
  sourceType: SourceType;
  sourceUrl: string;
  description?: string;
}

export interface RawOpportunity {
  title: string;
  organizationName: string;
  category?: string;
  description: string;
  rewardAmount?: number;
  currency?: string;
  location?: string;
  isRemote?: boolean;
  applicationDeadline?: string;
  officialUrl: string;
  requirements?: Array<{
    requirement_type: string;
    criteria_json: any;
    is_mandatory: boolean;
  }>;
  rawPayload?: Record<string, any>;
}

export interface VerificationCheck {
  name: string;
  passed: boolean;
  isMandatory: boolean;
  details: string;
}

export interface VerificationResult {
  status: VerificationStatus;
  lifecycleStatus: LifecycleStatus;
  confidence: number;
  checks: VerificationCheck[];
  evidence: Record<string, any>;
  warnings: string[];
  errors: string[];
  verifiedAt: string;
}

export interface IngestionRunRecord {
  id: string;
  source_name: string;
  source_type: string;
  started_at: string;
  completed_at?: string;
  total_records: number;
  successful_records: number;
  rejected_records: number;
  duplicate_records: number;
  expired_records: number;
  verification_pending_records: number;
  status: 'running' | 'completed' | 'failed';
  errors?: Array<{ index: number; error: string; recordTitle?: string }>;
  created_at: string;
}

