export type CanonicalDocumentType =
  | 'resume'
  | 'identity'
  | 'income_certificate'
  | 'community_certificate'
  | 'bonafide_certificate'
  | 'college_id'
  | 'transcript'
  | 'degree_certificate'
  | 'passport'
  | 'bank_document'
  | 'recommendation'
  | 'portfolio'
  | 'other';

export const DOCUMENT_TYPE_LABELS: Record<CanonicalDocumentType, string> = {
  resume: 'Resume / CV',
  identity: 'Aadhaar / Identity Document',
  income_certificate: 'Income Certificate',
  community_certificate: 'Community Certificate',
  bonafide_certificate: 'Bonafide Certificate',
  college_id: 'College ID Card',
  transcript: 'Marksheet / Academic Transcript',
  degree_certificate: 'Degree / Provisional Certificate',
  passport: 'Passport',
  bank_document: 'Bank Passbook / Statement',
  recommendation: 'Recommendation Letter (LOR)',
  portfolio: 'Portfolio / Project Proof',
  other: 'Other Supporting Document',
};

export type DocumentVerificationStatus =
  | 'unverified'
  | 'pending_verification'
  | 'verified'
  | 'rejected'
  | 'expired';

export interface DocumentRecord {
  id: string;
  student_id: string;
  title: string;
  document_type: CanonicalDocumentType;
  file_path: string;
  file_size_bytes?: number;
  mime_type?: string;
  extracted_metadata?: Record<string, any>;
  is_verified?: boolean;
  verification_status: DocumentVerificationStatus;
  expiry_date?: string | null;
  status: 'active' | 'archived' | 'deleted';
  source: string;
  created_at: string;
  updated_at: string;
  viewUrl?: string | null;
}

export type DocumentGapStatus = 'available' | 'missing' | 'expired' | 'pending_verification';

export interface DocumentGapItem {
  documentType: CanonicalDocumentType;
  title: string;
  description: string;
  isMandatory: boolean;
  status: DocumentGapStatus;
  documentId?: string;
  fileName?: string;
  expiryDate?: string | null;
  actionRequired: string;
}

export type DocumentReadinessStatus =
  | 'READY'
  | 'PARTIALLY_READY'
  | 'MISSING_DOCUMENTS'
  | 'MORE_INFORMATION'
  | 'NOT_APPLICABLE';

export interface DocumentGapAnalysis {
  opportunityId: string;
  opportunityTitle?: string;
  requiredDocuments: DocumentGapItem[];
  availableDocuments: DocumentGapItem[];
  missingDocuments: DocumentGapItem[];
  expiredDocuments: DocumentGapItem[];
  pendingVerificationDocuments: DocumentGapItem[];
  readinessStatus: DocumentReadinessStatus;
  completionPercentage: number;
  warnings: string[];
}

export interface CertificateGuidanceItem {
  documentType: CanonicalDocumentType;
  title: string;
  whyRequired: string;
  isRequired: boolean;
  studentHasIt: boolean;
  status: DocumentGapStatus;
  expiryDate?: string | null;
  officialPortalUrl?: string;
  whatToDoNext: string;
}

export interface CertificateGuidanceResult {
  opportunityId: string;
  guidanceItems: CertificateGuidanceItem[];
  notes: string[];
}
