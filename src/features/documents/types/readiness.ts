import { DocumentGapAnalysis } from './documents';

export interface ReadinessChecklistItem {
  key: 'profile' | 'eligibility' | 'match' | 'documents' | 'deadline';
  label: string;
  isReady: boolean;
  statusText: string;
  details: string;
  actionUrl?: string;
  isBlocking: boolean;
}

export interface ApplicationReadinessResult {
  opportunityId: string;
  opportunityTitle?: string;
  profileReady: boolean;
  eligibilityReady: boolean;
  matchReady: boolean;
  documentsReady: boolean;
  deadlineReady: boolean;
  overallReady: boolean;
  overallStatus: 'READY' | 'PARTIALLY_READY' | 'BLOCKED' | 'EXPIRED';
  eligibilityStatus: string;
  matchScore: number;
  blockers: string[];
  warnings: string[];
  checklist: ReadinessChecklistItem[];
  documentGap: DocumentGapAnalysis;
  calculatedAt: string;
}

export type AIDraftType =
  | 'resume_tailoring'
  | 'statement_of_purpose'
  | 'scholarship_essay'
  | 'internship_email'
  | 'application_answer';

export interface AIDraftResult {
  draftType: AIDraftType;
  content: string;
  generatedAt: string;
  model: string;
  disclaimer: string;
  studentFactsUsed: {
    educationProvided: boolean;
    skillsCount: number;
    experienceProvided: boolean;
    certificationsCount: number;
  };
  humanApproved: boolean;
}
