import { DocumentGapAnalysis } from './document.js';
import { EligibilityStatus } from './eligibility.js';

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
  eligibilityStatus: EligibilityStatus;
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

export interface AIDraftRequest {
  draftType: AIDraftType;
  promptGuidance?: string;
  targetRoleOrScholarship?: string;
  questionText?: string;
}

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

export interface ApplicationPreparationRecord {
  id: string;
  studentId: string;
  opportunityId: string;
  status: 'draft' | 'in_review' | 'ready' | 'submitted';
  humanApproved: boolean;
  approvedAt?: string | null;
  submittedAt?: string | null;
  attachedDocuments: {
    documentId: string;
    documentType: string;
    title: string;
    purpose: string;
  }[];
  draftContent: Record<string, any>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
