import { apiClient } from '../lib/apiClient';
import { Opportunity } from '../types/opportunity';

export const opportunityService = {
  async getOpportunities(category?: string): Promise<Opportunity[]> {
    const endpoint = category ? `/opportunities?category=${category}` : '/opportunities';
    const res = await apiClient<Opportunity[]>(endpoint);
    return res.data;
  },

  async getOpportunityById(id: string): Promise<Opportunity> {
    const res = await apiClient<Opportunity>(`/opportunities/${id}`);
    return res.data;
  },

  async saveOpportunity(id: string) {
    const res = await apiClient(`/opportunities/${id}/save`, { method: 'POST' });
    return res.data;
  },

  async unsaveOpportunity(id: string) {
    const res = await apiClient(`/opportunities/${id}/save`, { method: 'DELETE' });
    return res.data;
  },

  async matchOpportunity(studentId: string, opportunityId: string) {
    const res = await apiClient('/opportunities/match', {
      method: 'POST',
      body: JSON.stringify({ studentId, opportunityId }),
    });
    return res.data;
  },
};
