import { apiClient } from '../../../lib/apiClient';
import { AIDraftType, AIDraftResult, ApplicationReadinessResult } from '../../documents/types/readiness';
import { Opportunity } from '../../../types/opportunity';

export interface ApplicationItem {
  id: string;
  student_id: string;
  opportunity_id: string;
  status: string;
  match_score?: number | null;
  match_reasoning?: string | null;
  human_approved: boolean;
  approved_at?: string | null;
  submitted_at?: string | null;
  notes?: string | null;
  draft_content?: Record<string, any>;
  application_answers?: Record<string, any>;
  created_at: string;
  updated_at: string;
  opportunities?: Opportunity;
  application_documents?: {
    id: string;
    document_id: string;
    purpose: string;
    documents?: {
      id: string;
      title: string;
      document_type: string;
      file_path: string;
    };
  }[];
}

export interface PreparationWorkspaceData {
  application: ApplicationItem;
  readiness: ApplicationReadinessResult;
  attachedDocuments: any[];
  opportunity: Opportunity;
}

export const applicationService = {
  async getApplications(): Promise<ApplicationItem[]> {
    const res = await apiClient<ApplicationItem[]>('/applications');
    return res.data || [];
  },

  async getApplicationById(applicationId: string): Promise<ApplicationItem> {
    const res = await apiClient<ApplicationItem>(`/applications/${applicationId}`);
    return res.data!;
  },

  async prepareApplication(opportunityId: string): Promise<PreparationWorkspaceData> {
    const res = await apiClient<PreparationWorkspaceData>('/applications/prepare', {
      method: 'POST',
      body: JSON.stringify({ opportunityId }),
    });
    return res.data!;
  },

  async attachDocument(applicationId: string, documentId: string, purpose?: string): Promise<any> {
    const res = await apiClient<any>(`/applications/${applicationId}/documents`, {
      method: 'POST',
      body: JSON.stringify({ documentId, purpose }),
    });
    return res.data!;
  },

  async detachDocument(applicationId: string, documentId: string): Promise<boolean> {
    const res = await apiClient<{ message: string }>(
      `/applications/${applicationId}/documents/${documentId}`,
      {
        method: 'DELETE',
      }
    );
    return res.success;
  },

  async generateAIDraft(
    applicationId: string,
    draftType: AIDraftType,
    context?: { promptGuidance?: string; questionText?: string }
  ): Promise<AIDraftResult> {
    const res = await apiClient<AIDraftResult>(
      `/applications/${applicationId}/draft/${draftType}`,
      {
        method: 'POST',
        body: JSON.stringify(context || {}),
      }
    );
    return res.data!;
  },

  async updateDraftContent(
    applicationId: string,
    draftType: string,
    content: string
  ): Promise<any> {
    const res = await apiClient<any>(`/applications/${applicationId}/draft`, {
      method: 'PUT',
      body: JSON.stringify({ draftType, content }),
    });
    return res.data!;
  },


  async approveApplication(applicationId: string): Promise<ApplicationItem> {
    const res = await apiClient<ApplicationItem>(`/applications/${applicationId}/approve`, {
      method: 'PUT',
    });
    return res.data!;
  },
};
