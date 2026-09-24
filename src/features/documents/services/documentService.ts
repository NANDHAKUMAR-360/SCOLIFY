import { apiClient } from '../../../lib/apiClient';
import {
  DocumentRecord,
  CanonicalDocumentType,
  DocumentGapAnalysis,
  CertificateGuidanceResult,
} from '../types/documents';
import { ApplicationReadinessResult } from '../types/readiness';

export const documentService = {
  async getDocuments(): Promise<DocumentRecord[]> {
    const res = await apiClient<DocumentRecord[]>('/documents');
    return res.data || [];
  },

  async createDocument(payload: {
    title: string;
    documentType: CanonicalDocumentType;
    filePath?: string;
    fileSizeBytes?: number;
    mimeType?: string;
    expiryDate?: string | null;
  }): Promise<DocumentRecord> {
    const res = await apiClient<DocumentRecord>('/documents', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data!;
  },


  async deleteDocument(documentId: string): Promise<boolean> {
    const res = await apiClient<{ message: string }>(`/documents/${documentId}`, {
      method: 'DELETE',
    });
    return res.success;
  },

  async getSignedUrl(documentId: string): Promise<string | null> {
    const res = await apiClient<{ signedUrl: string }>(`/documents/${documentId}/signed-url`);
    return res.data?.signedUrl || null;
  },

  async getDocumentGap(opportunityId: string): Promise<DocumentGapAnalysis> {
    const res = await apiClient<DocumentGapAnalysis>(`/opportunities/${opportunityId}/documents/gap`);
    return res.data!;
  },

  async getCertificateGuidance(opportunityId: string): Promise<CertificateGuidanceResult> {
    const res = await apiClient<CertificateGuidanceResult>(
      `/opportunities/${opportunityId}/documents/guidance`
    );
    return res.data!;
  },

  async getApplicationReadiness(opportunityId: string): Promise<ApplicationReadinessResult> {
    const res = await apiClient<ApplicationReadinessResult>(
      `/opportunities/${opportunityId}/readiness`
    );
    return res.data!;
  },
};
