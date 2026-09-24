export interface StudentDocument {
  id: string;
  studentId: string;
  title: string;
  documentType: 'resume' | 'transcript' | 'essay' | 'recommendation' | 'portfolio' | 'other';
  filePath: string;
  fileSizeBytes?: number;
  mimeType?: string;
  extractedMetadata?: Record<string, any>;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentCertification {
  id: string;
  studentId: string;
  title: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  verified: boolean;
  createdAt: string;
}
