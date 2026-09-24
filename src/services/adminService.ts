import { apiClient } from '../lib/apiClient';

export interface IngestPayload {
  sourceType: string;
  sourceName?: string;
  sourceUrl?: string;
  payload?: any;
}

export const adminService = {
  async triggerIngestion(data: IngestPayload) {
    const res = await apiClient('/admin/opportunities/ingest', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async getReviewList(status?: string, lifecycleStatus?: string) {
    let query = '';
    if (status) query += `status=${status}&`;
    if (lifecycleStatus) query += `lifecycleStatus=${lifecycleStatus}&`;
    const res = await apiClient<any[]>(`/admin/opportunities/review?${query}`);
    return res.data;
  },

  async getVerificationDetails(id: string) {
    const res = await apiClient<any>(`/admin/opportunities/${id}/verification`);
    return res.data;
  },

  async verifyAction(id: string, status: string, reasoning: string, lifecycleStatus?: string) {
    const res = await apiClient(`/admin/opportunities/${id}/verification`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reasoning, lifecycleStatus }),
    });
    return res.data;
  },

  async getIngestionRunStatus(runId: string) {
    const res = await apiClient<any>(`/admin/ingestion/runs/${runId}`);
    return res.data;
  },
};
