import { OpportunityCategory } from './student';

export type VerificationStatus = 'verified' | 'partially_verified' | 'unverified' | 'warning' | 'needs_review';

export interface OpportunityRequirement {
  id?: string;
  opportunityId?: string;
  requirementType: string; // gpa, degree, skill, location, essay
  requirement_type?: string;
  criteriaJson: Record<string, any>;
  criteria_json?: Record<string, any>;
  isMandatory: boolean;
  is_mandatory?: boolean;
}

export interface OpportunitySource {
  id?: string;
  opportunityId?: string;
  sourceName: string;
  source_name?: string;
  sourceUrl: string;
  source_url?: string;
  sourceType?: string;
  crawledAt?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  organizationName: string;
  category: OpportunityCategory;
  description: string;
  rewardAmount?: number;
  currency?: string;
  location?: string;
  isRemote: boolean;
  applicationDeadline?: string;
  officialUrl: string;
  verificationStatus: VerificationStatus;
  confidenceScore: number;
  verificationReasoning?: string;
  isActive: boolean;
  requirements?: OpportunityRequirement[];
  sources?: OpportunitySource[];
  isSaved?: boolean;
  matchScore?: number;
  matchReasoning?: string;
  createdAt: string;
  updatedAt: string;
}

export { type OpportunityCategory } from './student';
